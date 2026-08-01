export type VehicleType = "SUV" | "Truck" | "Sedan" | "Convertible" | "Van" | "Luxury";

export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  type: VehicleType;
  photos: string[];
  rating: number;
  tripCount: number;
  verifiedCompany: boolean;
  pricePerDay: number;
  location: string;
  seats: number;
  fuel: string;
  mpg: number;
  drivetrain: string;
  transmission: string;
  features: string[];
  companyId: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  bannerUrl: string;
  avatarUrl: string;
  verified: boolean;
  allStarHost: boolean;
  rating: number;
  tripCount: number;
  yearsHosting: number;
  responseTime: string;
  bio: string;
  vehicleIds: string[];
};

export type Review = {
  id: string;
  vehicleId: string;
  authorName: string;
  authorAvatarUrl: string;
  rating: number;
  date: string;
  comment: string;
};

export type TripStatus =
  | "requested"
  | "confirmed"
  | "upcoming"
  | "active"
  | "completed"
  | "canceled";

export type Trip = {
  id: string;
  vehicleId: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  days: number;
  pickupLocation: string;
  pickupAddress: string;
  total: number;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: "guest" | "company";
  text: string;
  timestamp: string;
  read: boolean;
};

export type MessageThread = {
  id: string;
  companyId: string;
  vehicleId?: string;
  tripId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  activeStatus: string;
};

export type SearchFilters = {
  priceMin: number;
  priceMax: number;
  vehicleTypes: VehicleType[];
  make: string | null;
  year: string | null;
  transmission: string | null;
  seats: string | null;
  allStarHostsOnly: boolean;
  unlimitedDistance: boolean;
  wheelchairAccessible: boolean;
};

export const DEFAULT_FILTERS: SearchFilters = {
  priceMin: 25,
  priceMax: 300,
  vehicleTypes: [],
  make: null,
  year: null,
  transmission: null,
  seats: null,
  allStarHostsOnly: false,
  unlimitedDistance: false,
  wheelchairAccessible: false,
};

export type ProtectionPlanId = "standard" | "plus" | "premium";

export type ProtectionPlan = {
  id: ProtectionPlanId;
  name: string;
  pricePerDay: number;
  coverageSummary: string;
  outOfPocket: string;
};

export type PickupOptionId = "vehicle" | "airport" | "delivery";

export type ListingStatus = "live" | "draft" | "paused" | "hidden" | "needs_action";

export type HostVehicleListing = {
  id: string;
  vehicleId: string;
  status: ListingStatus;
};
