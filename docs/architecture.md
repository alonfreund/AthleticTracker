# Current architecture

React screens call data operations. Domain types and validation are separate from UI. Dexie schema v3 preserves the original metadata and foundationRecords tables and adds structured strength tables. See [the strength data model](strength-data-model.md).

New strength tables are data-only: library definitions, session/activity/exercise identities, independent snapshots, structured sets and targets, superset configuration, recoverable timer state and raw input drafts. No strength logging UI or mutation workflow is implemented yet. No cardio, routines, programmes or analytics logic is added.

Backup format v2 covers all persistent IndexedDB tables in one transaction. V1 imports normalize missing strength tables to empty. Validation runs before writes and checks relationships. Replacement restores clear and reinsert all supported tables atomically; failures roll back. The existing safety-download and confirmation flow remains, with a warning about older backups replacing all current workouts. Download retention cannot be guaranteed by browser APIs.

The previously implemented safe-update gate protects unsaved foundation drafts. Storage persistence is browser-controlled, and the last download-request timestamp remains a small device-local preference. Backups remain necessary. Multiple-copy conflict management is deferred.

59 tests plus a production-preview browser migration check verify this increment. Workout-logging repositories and screens are the next implementation stage.
