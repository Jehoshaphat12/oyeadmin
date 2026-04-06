import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { ref, onValue, off } from 'firebase/database';
import { firestore, database } from '../lib/firebase';
import { parseFare } from '../utils/helpers';
import type { User, Driver, Ride, DriverInfo, VehicleType, RideStatus } from '../types';

// ─── Timestamp → Date ─────────────────────────────────────────────────────────
function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Timestamp((val as any).seconds, (val as any).nanoseconds ?? 0).toDate();
  }
  return new Date(val as string);
}

function toDateOrUndef(val: unknown): Date | undefined {
  if (!val) return undefined;
  return toDate(val);
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

function parseUser(id: string, data: Record<string, any>): User {
  return {
    id,
    email: data.email ?? '',
    name: data.name ?? 'Unknown',
    phone: data.phone ?? '',
    photoUrl: data.photoUrl,
    userType: data.userType ?? 'passenger',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    createdAt: toDate(data.createdAt),
    // App writes totalRides on user doc (passenger) and totalTrips on driver doc
    totalRides: data.totalRides ?? data.totalTrips ?? 0,
    fcmToken: data.fcmToken ?? null,
    pushToken: data.pushToken ?? null,
    tokenUpdatedAt: toDateOrUndef(data.tokenUpdatedAt),
  };
}

function parseDriver(id: string, data: Record<string, any>): Driver {
  return {
    id,
    userId: data.userId ?? id,
    name: data.name ?? 'Unknown',
    email: data.email ?? '',
    phone: data.phone ?? '',
    vehicle: {
      vehicleType: (data.vehicle?.vehicleType ?? 'motor') as VehicleType,
      color: data.vehicle?.color ?? '',
      vehicleNumber: data.vehicle?.vehicleNumber ?? '',
      vehicleModel: data.vehicle?.vehicleModel ?? '',
    },
    isAvailable: data.isAvailable ?? false,
    isOnline: data.isOnline ?? false,
    currentLocation: {
      latitude: data.currentLocation?.latitude ?? 0,
      longitude: data.currentLocation?.longitude ?? 0,
      heading: data.currentLocation?.heading,
      speed: data.currentLocation?.speed,
    },
    photoUrl: data.photoUrl ?? '',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    // OyeRide stores totalTrips (not totalRides) on the driver doc
    totalTrips: data.totalTrips ?? 0,
    geohash: data.geohash ?? '',
    lastUpdated: toDate(data.lastUpdated ?? data.updatedAt),
    distance: data.distance ?? 0,
    isVerified: data.isVerified ?? false,
    fcmToken: data.fcmToken ?? '',
    // earnings is NOT written by the app — computed client-side from completed rides.
    // Will be 0 for all drivers unless manually updated in Firestore.
    earnings: {
      today: parseFare(data.earnings?.today),
      weekly: parseFare(data.earnings?.weekly),
      monthly: parseFare(data.earnings?.monthly),
      total: parseFare(data.earnings?.total),
    },
    documents: data.documents ?? {},
    createdAt: toDate(data.createdAt),
  };
}

function parseDriverInfo(raw: Record<string, any> | undefined): DriverInfo | undefined {
  if (!raw) return undefined;
  return {
    name: raw.name ?? '',
    phone: raw.phone ?? '',
    photoUrl: raw.photoUrl ?? null,
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    vehicle: {
      vehicleType: (raw.vehicle?.vehicleType ?? 'motor') as VehicleType,
      color: raw.vehicle?.color ?? '',
      vehicleNumber: raw.vehicle?.vehicleNumber ?? '',
      vehicleModel: raw.vehicle?.vehicleModel ?? '',
    },
  };
}

function parseRide(id: string, data: Record<string, any>): Ride {
  return {
    id,
    passengerId: data.passengerId ?? '',
    passengerName: data.passengerName ?? 'Unknown',
    passengerPhone: data.passengerPhone ?? '',
    // App writes passengerPhoto (not passengerPhotoUrl) — RideService.requestRide
    passengerPhoto: data.passengerPhoto ?? data.passengerPhotoUrl,
    passengerRating: data.passengerRating ?? null,

    driverId: data.driverId,
    // App writes driverInfo (not driver) when a ride is accepted — RideService.acceptRide
    driverInfo: parseDriverInfo(data.driverInfo),

    driverRating: data.driverRating ?? 0,
    driverFeedback: data.driverFeedback ?? '',
    driverFeedbackTags: data.driverFeedbackTags ?? [],

    vehicleType: (data.vehicleType ?? 'motor') as VehicleType,
    status: (data.status ?? 'requesting') as RideStatus,

    pickup: {
      latitude: data.pickup?.latitude ?? 0,
      longitude: data.pickup?.longitude ?? 0,
      address: data.pickup?.address ?? '',
    },
    destinations: Array.isArray(data.destinations)
      ? data.destinations.map((d: any) => ({
          latitude: d.latitude ?? 0,
          longitude: d.longitude ?? 0,
          address: d.address ?? '',
          sequence: d.sequence ?? 0,
        }))
      : [],
    geohash: data.geohash ?? '',

    packageInfo: data.packageInfo,

    distance: typeof data.distance === 'number' ? data.distance : 0,
    duration: typeof data.duration === 'number' ? data.duration : 0,
    // totalFare can arrive as string from older records
    totalFare: parseFare(data.totalFare),

    // App stores BOTH requestedAt (new Date()) and createdAt (serverTimestamp()).
    // Use requestedAt first, fall back to createdAt for ordering consistency.
    requestedAt: toDate(data.requestedAt ?? data.createdAt),
    createdAt: toDateOrUndef(data.createdAt),
    acceptedAt: toDateOrUndef(data.acceptedAt),
    startedAt: toDateOrUndef(data.startedAt),
    completedAt: toDateOrUndef(data.completedAt),

    userRating: data.userRating,
    userFeedback: data.userFeedback,
    feedbackTags: data.feedbackTags,

    paymentMethod: data.paymentMethod,
    surgeMultiplier: data.surgeMultiplier,
    surgeReason: data.surgeReason,
    cancellationReason: data.cancellationReason ?? null,
    cancelledBy: data.cancelledBy ?? null,
  };
}

// ─── Hook: Passengers ────────────────────────────────────────────────────────
// No orderBy here — avoids needing a composite index on (userType, createdAt)
// that the OyeRide app may never have created. Sort client-side instead.
export function usePassengers() {
  const [passengers, setPassengers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, 'users'),
      where('userType', '==', 'passenger'),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => parseUser(d.id, d.data()))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setPassengers(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { passengers, loading };
}

// ─── Hook: Drivers ────────────────────────────────────────────────────────────
// OyeRide writes createdAt to drivers — single-field index is auto-created.
export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, 'drivers'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setDrivers(snap.docs.map((d) => parseDriver(d.id, d.data())));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { drivers, loading };
}

// ─── Hook: Incoming Rides (status == "requesting") ────────────────────────────
// MUST use createdAt — the app's composite index is on (status, createdAt DESC).
// Using requestedAt here would cause a missing-index error in production.
export function useIncomingRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, 'rides'),
      where('status', '==', 'requesting'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setRides(snap.docs.map((d) => parseRide(d.id, d.data())));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { rides, loading };
}

// ─── Hook: Recent Rides ───────────────────────────────────────────────────────
export function useRecentRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, 'rides'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setRides(snap.docs.map((d) => parseRide(d.id, d.data())));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { rides, loading };
}

// ─── Hook: Ride History (completed + cancelled) ───────────────────────────────
// Composite index on (status, createdAt DESC) exists — same query the app uses.
export function useRideHistory() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, 'rides'),
      where('status', 'in', ['completed', 'cancelled']),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setRides(snap.docs.map((d) => parseRide(d.id, d.data())));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { rides, loading };
}

// ─── Hook: Today's Revenue (summed from completed rides today) ───────────────
// Since the driver doc doesn't store earnings, we derive revenue from rides.
export function useTodayRevenue() {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const q = query(
      collection(firestore, 'rides'),
      where('status', '==', 'completed'),
      where('createdAt', '>=', Timestamp.fromDate(startOfToday)),
      orderBy('createdAt', 'desc'),
      limit(500)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + parseFare(d.data().totalFare), 0);
        setRevenue(total);
      },
      () => {}
    );

    return unsub;
  }, []);

  return revenue;
}

// ─── Hook: Driver real-time locations (Realtime Database) ────────────────────
export function useDriverLocations() {
  const [locations, setLocations] = useState<Record<string, any>>({});

  useEffect(() => {
    const locRef = ref(database, 'driver_locations');
    const handler = onValue(locRef, (snap) => {
      if (snap.exists()) setLocations(snap.val());
    });
    return () => off(locRef, 'value', handler);
  }, []);

  return locations;
}

// ─── Hook: Last 7 days ride + revenue stats for the bar chart ─────────────────
export interface DayStats {
  label: string;      // e.g. "Mon"
  date: string;       // ISO yyyy-mm-dd — used to identify "today"
  rides: number;
  revenue: number;
}

export function useWeeklyStats() {
  const [days, setDays] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build the 7-day window: today at midnight going back 6 days
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const windowStart = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

    const q = query(
      collection(firestore, 'rides'),
      where('createdAt', '>=', Timestamp.fromDate(windowStart)),
      orderBy('createdAt', 'asc'),
      limit(2000)          // safety cap — 2 000 rides / 7 days is generous headroom
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        // Initialise a bucket for each of the 7 days
        const buckets: Record<string, DayStats> = {};
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
          const d = new Date(startOfToday.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const key = d.toISOString().slice(0, 10); // "yyyy-mm-dd"
          buckets[key] = {
            label: dayNames[d.getDay()],
            date: key,
            rides: 0,
            revenue: 0,
          };
        }

        // Tally each ride into the correct day bucket
        snap.docs.forEach((doc) => {
          const data = doc.data();
          const ts = data.createdAt;
          if (!ts) return;

          const rideDate = ts instanceof Timestamp
            ? ts.toDate()
            : typeof ts === 'object' && 'seconds' in ts
              ? new Timestamp(ts.seconds, ts.nanoseconds ?? 0).toDate()
              : new Date(ts);

          const key = rideDate.toISOString().slice(0, 10);
          if (!buckets[key]) return; // outside window (shouldn't happen)

          buckets[key].rides += 1;
          // Only count completed rides toward revenue
          if (data.status === 'completed') {
            buckets[key].revenue += parseFare(data.totalFare);
          }
        });

        setDays(Object.values(buckets)); // already in chronological order
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { days, loading };
}
