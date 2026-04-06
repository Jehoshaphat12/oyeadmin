// ─── Matches @types/index.ts in OyeRide exactly ──────────────────────────────

export type VehicleType = 'motor' | 'delivery' | 'bicycle_delivery';

// All statuses the app can write (arriving/arrived are used in the driver flow)
export type RideStatus =
  | 'requesting'
  | 'accepted'
  | 'arriving'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  photoUrl?: string;
  userType: 'passenger' | 'driver';
  rating: number;
  avatar?: string;
  createdAt: Date;
  /** Only on passenger docs — optional */
  totalRides?: number;
  fcmToken: string | null;
  pushToken: string | null;
  tokenUpdatedAt?: Date;
}

export interface Vehicle {
  vehicleType: VehicleType;
  color: string;
  vehicleNumber: string;
  vehicleModel: string;
}

export interface Earnings {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicle: Vehicle;
  isAvailable: boolean;
  isOnline: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  };
  photoUrl: string;
  rating: number;
  /** Firestore field is totalTrips — matches OyeRide @types */
  totalTrips: number;
  geohash: string;
  lastUpdated: Date;
  /** Computed at query time by RideService.findNearbyDrivers, not stored */
  distance: number;
  isVerified: boolean;
  fcmToken: string;
  /**
   * NOTE: The OyeRide app computes earnings client-side from completed rides
   * and does NOT write them back to the driver document. This field will be
   * absent / all-zeros for most drivers until the app is updated to persist it.
   */
  earnings: Earnings;
  documents: unknown;
  createdAt: Date;
}

/**
 * Lightweight driver info written to a ride when it is accepted.
 * The app writes `driverInfo` (not a full `driver` doc embed) via RideService.acceptRide.
 */
export interface DriverInfo {
  name: string;
  phone: string;
  photoUrl: string | null;
  rating: number;
  vehicle: Vehicle;
}

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  /** Written as `passengerPhoto` in RideService.requestRide */
  passengerPhoto?: string;
  passengerRating?: number | null;

  driverId?: string;
  /**
   * Written by RideService.acceptRide as `driverInfo` — NOT a full Driver embed.
   * Use this to show the driver's name/phone/vehicle on ride rows.
   */
  driverInfo?: DriverInfo;
  /** Never populated from Firestore — use driverInfo instead */
  driver?: Driver;

  /** Driver's rating of the passenger (written by driver on completion) */
  driverRating: number;
  driverFeedback: string;
  driverFeedbackTags: string[];

  vehicleType: VehicleType;
  status: RideStatus;

  pickup: { latitude: number; longitude: number; address: string };
  destinations: Array<{
    latitude: number;
    longitude: number;
    address: string;
    sequence: number;
  }>;
  geohash: string;

  packageInfo?: {
    recipientName: string;
    recipientPhone: string;
    itemDescription: string;
    image: string;
  };

  distance: number;
  duration: number;
  totalFare: number;

  /** Firestore timestamp — the app also stores `createdAt` via serverTimestamp */
  requestedAt: Date;
  /** Firestore: serverTimestamp() set by FirestoreService.createRide */
  createdAt?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  /** Passenger's rating of the driver */
  userRating?: number;
  userFeedback?: string;
  feedbackTags?: string[];

  // Extra fields written by RideService.requestRide
  paymentMethod?: string;
  surgeMultiplier?: number;
  surgeReason?: string;
  cancellationReason?: string | null;
  cancelledBy?: 'passenger' | 'driver' | null;
  cancelledAt?: Date | null;
}

export type Page = 'dashboard' | 'passengers' | 'drivers' | 'history' | 'recent' | 'incoming';
