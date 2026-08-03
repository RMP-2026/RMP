-- Run once, after `drizzle-kit push` has created the tables (drizzle's schema DSL has
-- no EXCLUDE-constraint or CREATE EXTENSION support, so this stays hand-written SQL
-- rather than generated). Idempotent — safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid() for the uuid PK columns
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- required for EXCLUDE USING gist below
CREATE EXTENSION IF NOT EXISTS cube;        -- Phase 3 nearby-search (earthdistance dependency)
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Phase 3 fuzzy search indexes

-- Double-booking guard: no two bookings in a "blocking" status may hold overlapping
-- [start_date, end_date) ranges for the same vehicle. The status list here must match
-- packages/shared's BLOCKING_BOOKING_STATUSES.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    daterange(start_date, end_date, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'approved', 'active', 'blocked'));

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_range;
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5);
