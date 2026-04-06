// ─── Matches @types/index.ts in OyeRide — plus 'admin' userType ──────────────

export type VehicleType = 'motor' | 'delivery' | 'bicycle_delivery';

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
  // 'admin' added — dashboard checks this to gate access
  userType: 'passenger' | 'driver' | 'admin';
  rating: number;
  avatar?: string;
  createdAt: Date;
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
  totalTrips: number;
  geohash: string;
  lastUpdated: Date;
  distance: number;
  isVerified: boolean;
  fcmToken: string;
  earnings: Earnings;
  documents: unknown;
  createdAt: Date;
}

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
  passengerPhoto?: string;
  passengerRating?: number | null;

  driverId?: string;
  driverInfo?: DriverInfo;
  driver?: Driver;

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

  requestedAt: Date;
  createdAt?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  userRating?: number;
  userFeedback?: string;
  feedbackTags?: string[];

  paymentMethod?: string;
  surgeMultiplier?: number;
  surgeReason?: string;
  cancellationReason?: string | null;
  cancelledBy?: 'passenger' | 'driver' | null;
  cancelledAt?: Date | null;
}

export type Page =
  | 'dashboard'
  | 'passengers'
  | 'drivers'
  | 'history'
  | 'recent'
  | 'incoming';
