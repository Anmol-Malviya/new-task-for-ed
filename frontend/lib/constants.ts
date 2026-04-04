// frontend/lib/constants.ts

// ─── Cities ───────────────────────────────────────────────────────────────
export const CITIES = [
  "Indore",
  "Bhopal",
  "Jabalpur",
  "Gwalior",
  "Ujjain",
  "Rewa",
] as const;

// ─── Event Occasions ──────────────────────────────────────────────────────
export const OCCASIONS = [
  { id: "birthday",    label: "Birthday",    emoji: "🎂" },
  { id: "anniversary", label: "Anniversary", emoji: "💍" },
  { id: "baby_shower", label: "Baby Shower", emoji: "👶" },
  { id: "wedding",     label: "Wedding",     emoji: "💒" },
  { id: "bachelorette",label: "Bachelorette",emoji: "👰" },
  { id: "baby_welcome",label: "Baby Welcome",emoji: "🎉" },
  { id: "engagement",  label: "Engagement",  emoji: "💎" },
  { id: "rice_ceremony",label: "Rice Ceremony",emoji: "🍚" },
] as const;

// ─── Service Categories ───────────────────────────────────────────────────
export const CATEGORIES = [
  "Balloon Decoration",
  "Floral Decoration",
  "Cake & Desserts",
  "Photography",
  "Videography",
  "Makeup & Styling",
  "DJ & Music",
  "Mehndi",
  "Lighting",
  "Invitation Cards",
] as const;
// WHY THIS FILE EXISTS: if API_BASE_URL is hardcoded in 20 files and
// your backend port changes, you fix it in 20 places. Here you fix it once.

// ─── API ─────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
// NEXT_PUBLIC_ prefix is required for Next.js to expose this to the browser

// ─── Navigation ──────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Vendors',  href: '/vendors' },
  { label: 'About',    href: '/about' },
] as const;
// 'as const' makes this readonly — TypeScript will error if you
// accidentally try to push() or reassign items

// ─── Service categories ───────────────────────────────────────────────
export const SERVICE_CATEGORIES = [
  'Photography',
  'Catering',
  'Decoration',
  'Music & DJ',
  'Venue',
  'Makeup & Beauty',
  'Transport',
  'Mehendi',
] as const;

// This creates a type from the array values automatically
// So ServiceCategory can only be one of the strings above
export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

// ─── Booking status ───────────────────────────────────────────────────
export const BOOKING_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// ─── Cookie name ──────────────────────────────────────────────────────
// Defined once so proxy.ts and utils.ts use the same string
// If you rename the cookie, change it here only
export const AUTH_COOKIE_NAME = 'ed_token';
export const AUTH_STORAGE_KEY = 'ed_token';