# Strength data foundation — 0.2.0

This increment adds models, runtime backup validation and database tables only. It does not add workout logging screens, exercise-library UI, cardio, custom-activity creation, routines, programmes, PR calculations or dashboards.

## Database version 3

The migration retains `metadata` and `foundationRecords` unchanged and adds empty tables:

| Table | Role |
| --- | --- |
| exercises | Library definitions, classifications, instructions, notes, tracking configuration, revision and archive state |
| sessions | Workout identity, active/finished/cancelled status, timestamps and notes |
| sessionActivities | Strength activity within a session, independently ordered; future modules can extend this |
| sessionExercises | Ordered movement instances with independent complete exercise snapshots, notes and rest overrides |
| strengthSets | Structured actual measurements, explicit load modes, targets, effort, type and completion |
| supersetGroups | Activity-owned group name and between-exercise/round rest rules |
| restTimers | One persisted deadline/paused state per session with optional completed source set |
| editorDrafts | Raw set-entry strings and entered unit, isolated from validated measurements |

All entity IDs are UUIDs. Dates are canonical UTC ISO strings. Positions are non-negative integers and unique within their parent; gaps are allowed. Future reorder/remove operations must update dependent rows transactionally. This increment intentionally exposes no new write UI or mutation repository; those operations and invariants will be implemented with the logging flow.

Only strength is registered initially, and one strength activity per session and one active session are supported. Activities, exercises, sessions and individual strength performances have separate identities. Metrics such as reps, duration and effort are explicit typed measurements here; arbitrary metric-definition/value tables belong to the later custom-activity module. There is no universal optional-field table or speculative cardio implementation.

## Exercises and snapshots

Definitions contain primary/secondary muscle IDs (disjoint), equipment IDs, category, instructions, notes, tracking configuration, default rest, origin, revision and archived state. Classification IDs are strings; taxonomy UI and bundled catalog seeding are deferred.

Session exercises store their own deep snapshot. A library reference may be absent after deletion; export/restore must not require its presence. Renaming/reconfiguring a library entry cannot rewrite a stored snapshot. `snapshotExercise` deep-clones nested tracking/classification data. Intentional historical edits will require an explicit future logging operation.

## Sets and units

Tracking specifies reps or duration plus none/external/bodyweight/added/assisted load. External, added and assistance modes require a weight convention: total, per-hand or machine-display. No negative-weight encoding is used. Added load and assistance each have their own field and an optional bodyweight measurement. Unknown bodyweight remains null, not zero.

Mass stores the entered value and kg/lb unit. `massInKilograms` consistently derives the comparison value (1 lb = 0.45359237 kg); a redundant canonical field is not stored, avoiding mismatched values. PR rules must also compare equipment/load conventions and tracking modes before comparing quantities. No volume or estimated-1RM assumptions are baked in.

Set types: normal, warm-up, failure, drop-set, back-off, amrap. RPE is optional and bounded 1–10; RIR is optional and a non-negative integer. Targets have separate load, rep/duration and effort ranges; copying actuals will not modify targets. Completed repetition sets require positive whole repetitions and any required load; completed holds require positive seconds and no reps. Incomplete rows can have null measurements. Raw partially typed values (e.g. `1:`) belong only to editorDrafts. Zero measured external load is permitted, but bodyweight, when supplied, must be positive. Zero completed reps are currently not counted as a completed performance.

## Backup format version 2

All ten database tables are exported in one consistent read transaction. Format-v2 validation checks exact fields, types, IDs, dates, values, ordering and relationships, including snapshot tracking/load agreement and timer/draft ownership. Export uses the same validation as import.

Format-v1 files are validated against the original layout and normalized with empty strength tables. Historical v1 fixture files are unchanged. Full restore replaces every table; importing v1 therefore removes any newer workout data, and the review screen explicitly warns about this. New v2 files cannot be read by old app versions, which reject them rather than silently dropping workout data.

Restore validates and deep-copies input before opening one write transaction spanning every table. Clears and inserts roll back together on failure, including failure in the last table. The prior safety-snapshot check now includes all tables; this does not add general multiple-copy conflict management. Backup download history remains a device-local preference outside restorable data.

## Verification and limits

59 automated tests cover old-schema migration, all fields/modes, deep snapshot independence, unit conversion, missing/invalid relationships, malformed measurements, old backups, new full round trips, reopening, and late-transaction rollback. A production-preview browser upgrade from 0.1.2 to 0.2.0 preserved a saved test record. Actual iPhone schema-upgrade verification is still device-side.

Keep a backup before updating; do not downgrade to an old app against the newer database. Browser deletion/device loss still requires an external backup. Future changes to any persistent table must update backup coverage, validation, schema migration and fixtures together. No exercise or fitness data is seeded by this migration.
