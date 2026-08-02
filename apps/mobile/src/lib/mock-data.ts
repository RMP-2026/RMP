import type {
  CompanyProfile,
  MessageThread,
  Message,
  ProtectionPlan,
  Review,
  Trip,
  Vehicle,
} from "../types/rmp";
import {
  CITY_LA,
  CITY_LV,
  CITY_MIAMI,
  COMPANY_AVATAR,
  COMPANY_BANNER,
  VEHICLE_PHOTOS,
} from "./placeholder-images";

export const MOCK_COMPANY: CompanyProfile = {
  id: "company-1",
  name: "Sunshine Fleet Rentals",
  bannerUrl: COMPANY_BANNER,
  avatarUrl: COMPANY_AVATAR,
  verified: true,
  allStarHost: true,
  rating: 4.98,
  tripCount: 5904,
  yearsHosting: 8,
  responseTime: "a few hours",
  bio: "Sunshine Fleet Rentals is a verified rental company based in Miami, FL, offering a curated fleet of clean, well-maintained vehicles for every kind of trip.",
  vehicleIds: ["rav4", "model3", "bronco", "cherokee", "wrangler"],
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "rav4",
    year: 2025,
    make: "Toyota",
    model: "RAV4",
    trim: "XLE Premium AWD",
    type: "SUV",
    photos: VEHICLE_PHOTOS.rav4,
    rating: 4.98,
    tripCount: 132,
    verifiedCompany: true,
    pricePerDay: 68,
    location: "Miami, FL",
    seats: 5,
    fuel: "Gas",
    mpg: 28,
    drivetrain: "AWD",
    transmission: "Automatic",
    features: [
      "Bluetooth",
      "Backup camera",
      "Apple CarPlay",
      "Android Auto",
      "Heated seats",
      "Sunroof",
      "Keyless entry",
      "USB charger",
      "Lane assist",
      "Blind spot monitor",
      "Adaptive cruise control",
      "All-wheel drive",
    ],
    companyId: "company-1",
    unlimitedDistance: true,
    wheelchairAccessible: false,
  },
  {
    id: "model3",
    year: 2024,
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range AWD",
    type: "Luxury",
    photos: VEHICLE_PHOTOS.model3,
    rating: 4.96,
    tripCount: 98,
    verifiedCompany: true,
    pricePerDay: 86,
    location: "Los Angeles, CA",
    seats: 5,
    fuel: "Electric",
    mpg: 132,
    drivetrain: "AWD",
    transmission: "Automatic",
    features: ["Autopilot", "Premium audio", "Glass roof", "Supercharging"],
    companyId: "company-1",
    unlimitedDistance: true,
    wheelchairAccessible: true,
  },
  {
    id: "bronco",
    year: 2023,
    make: "Ford",
    model: "Bronco",
    trim: "Badlands",
    type: "SUV",
    photos: VEHICLE_PHOTOS.bronco,
    rating: 4.97,
    tripCount: 71,
    verifiedCompany: true,
    pricePerDay: 95,
    location: "Orlando, FL",
    seats: 5,
    fuel: "Gas",
    mpg: 20,
    drivetrain: "4WD",
    transmission: "Automatic",
    features: ["Removable doors", "Off-road tires", "Backup camera"],
    companyId: "company-1",
    unlimitedDistance: false,
    wheelchairAccessible: false,
  },
  {
    id: "cherokee",
    year: 2024,
    make: "Jeep",
    model: "Grand Cherokee",
    trim: "Limited",
    type: "SUV",
    photos: VEHICLE_PHOTOS.cherokee,
    rating: 4.95,
    tripCount: 54,
    verifiedCompany: true,
    pricePerDay: 82,
    location: "Miami, FL",
    seats: 5,
    fuel: "Gas",
    mpg: 24,
    drivetrain: "4WD",
    transmission: "Automatic",
    features: ["Panoramic sunroof", "Leather seats", "Navigation"],
    companyId: "company-1",
    unlimitedDistance: true,
    wheelchairAccessible: false,
  },
  {
    id: "wrangler",
    year: 2021,
    make: "Jeep",
    model: "Wrangler",
    trim: "Rubicon",
    type: "SUV",
    photos: VEHICLE_PHOTOS.wrangler,
    rating: 4.94,
    tripCount: 43,
    verifiedCompany: true,
    pricePerDay: 89,
    location: "Orlando, FL",
    seats: 4,
    fuel: "Gas",
    mpg: 22,
    drivetrain: "4WD",
    transmission: "Manual",
    features: ["Removable top", "Off-road tires", "Tow hooks"],
    companyId: "company-1",
    unlimitedDistance: false,
    wheelchairAccessible: false,
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    vehicleId: "rav4",
    authorName: "Alex Johnson",
    authorAvatarUrl: COMPANY_AVATAR,
    rating: 5,
    date: "July 2026",
    comment: "Spotless car, smooth pickup, would rent again.",
  },
  {
    id: "r2",
    vehicleId: "rav4",
    authorName: "Priya Nair",
    authorAvatarUrl: COMPANY_AVATAR,
    rating: 5,
    date: "June 2026",
    comment: "Great communication from the company and an easy return process.",
  },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: "trip-1",
    vehicleId: "rav4",
    status: "upcoming",
    startDate: "Aug 10",
    endDate: "Aug 13",
    days: 3,
    pickupLocation: "Miami International Airport",
    pickupAddress: "Miami, FL 33137",
    total: 204,
  },
  {
    id: "trip-2",
    vehicleId: "model3",
    status: "completed",
    startDate: "Jul 21",
    endDate: "Jul 24",
    days: 3,
    pickupLocation: "Los Angeles, CA",
    pickupAddress: "Los Angeles, CA 90001",
    total: 258,
  },
  {
    id: "trip-3",
    vehicleId: "wrangler",
    status: "canceled",
    startDate: "May 10",
    endDate: "May 13",
    days: 3,
    pickupLocation: "Orlando, FL",
    pickupAddress: "Orlando, FL 32801",
    total: 285,
  },
];

export const MOCK_THREADS: MessageThread[] = [
  {
    id: "thread-1",
    companyId: "company-1",
    vehicleId: "rav4",
    tripId: "trip-1",
    lastMessage: "Sounds great! See you then.",
    lastMessageAt: "10:32 AM",
    unreadCount: 0,
    activeStatus: "Active 2h ago",
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  "thread-1": [
    {
      id: "m1",
      threadId: "thread-1",
      senderId: "company",
      text: "Hi! I'll meet you at terminal curbside Tuesday, 10 AM.",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: "m2",
      threadId: "thread-1",
      senderId: "guest",
      text: "Sounds great! See you then.",
      timestamp: "10:32 AM",
      read: true,
    },
    {
      id: "m3",
      threadId: "thread-1",
      senderId: "company",
      text: "Thanks! I'll be in a white RAV4.",
      timestamp: "10:33 AM",
      read: true,
    },
  ],
};

export const PROTECTION_PLANS: ProtectionPlan[] = [
  {
    id: "standard",
    name: "Standard",
    pricePerDay: 0,
    coverageSummary: "Basic coverage",
    outOfPocket: "Up to $3,000",
  },
  {
    id: "plus",
    name: "Plus",
    pricePerDay: 50,
    coverageSummary: "Higher coverage, lower out-of-pocket",
    outOfPocket: "From $500",
  },
  {
    id: "premium",
    name: "Premium",
    pricePerDay: 90,
    coverageSummary: "Lowest out-of-pocket",
    outOfPocket: "From $0",
  },
];

export const POPULAR_DESTINATIONS = [
  { name: "Miami", state: "FL", fromPrice: 41, image: CITY_MIAMI },
  { name: "Los Angeles", state: "CA", fromPrice: 48, image: CITY_LA },
  { name: "Las Vegas", state: "NV", fromPrice: 36, image: CITY_LV },
] as const;

export const VEHICLE_CATEGORIES = [
  { label: "SUVs", type: "SUV", icon: "car-sport-outline" },
  { label: "Luxury", type: "Luxury", icon: "diamond-outline" },
  { label: "Trucks", type: "Truck", icon: "bus-outline" },
  { label: "Convertibles", type: "Convertible", icon: "sunny-outline" },
] as const;

export const DATE_OPTIONS = ["Aug 9, 10 AM", "Aug 10, 10 AM", "Aug 11, 10 AM", "Aug 12, 10 AM", "Aug 13, 10 AM"];

export function getDaysBetween(fromLabel: string, untilLabel: string): number {
  const fromIndex = DATE_OPTIONS.indexOf(fromLabel);
  const untilIndex = DATE_OPTIONS.indexOf(untilLabel);
  if (fromIndex === -1 || untilIndex === -1 || untilIndex <= fromIndex) return 1;
  return untilIndex - fromIndex;
}

export function getVehicleById(id: string): Vehicle | undefined {
  return MOCK_VEHICLES.find((v) => v.id === id);
}

export function getTripByVehicleId(vehicleId: string): Trip | undefined {
  return MOCK_TRIPS.find((t) => t.vehicleId === vehicleId);
}

export function getCompanyById(companyId: string): CompanyProfile | undefined {
  return companyId === MOCK_COMPANY.id ? MOCK_COMPANY : undefined;
}

export function getThreadByCompanyId(companyId: string): MessageThread | undefined {
  return MOCK_THREADS.find((t) => t.companyId === companyId);
}
