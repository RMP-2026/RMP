/**
 * The booking statuses that occupy a vehicle's calendar — i.e. block other bookings from
 * that date range. Used by:
 *  - the `bookings_no_overlap` EXCLUDE constraint (packages/db/drizzle/0000_.../extensions.sql)
 *  - the Phase 3 search-availability query's date-range exclusion
 * Keep these in sync — this is the single source of truth for "does this booking hold
 * the dates," so neither consumer re-derives its own list.
 */
export const BLOCKING_BOOKING_STATUSES = ["pending", "approved", "active", "blocked"] as const;

export type BlockingBookingStatus = (typeof BLOCKING_BOOKING_STATUSES)[number];
