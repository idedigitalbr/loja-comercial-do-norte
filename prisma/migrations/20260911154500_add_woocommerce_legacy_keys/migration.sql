-- This migration used to run before the initial schema and could fail on a
-- clean database. The actual legacy columns are applied idempotently by the
-- follow-up migration after the base tables exist.
SELECT 1;
