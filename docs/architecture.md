# Current architecture

React screens call data operations. Domain types and validation are separate from UI. Dexie schema v3 preserves the original metadata and foundationRecords tables and adds structured strength tables. See [the strength data model](strength-data-model.md).

New strength tables are data-only: library definitions, session/activity/exercise identities, independent snapshots, structured sets and targets, superset configuration, recoverable timer state and raw input drafts. Exercise-library search, details and custom creation are implemented; core strength-session logging is implemented. No cardio, routines, programmes or analytics logic is added.

Backup format v2 covers all persistent IndexedDB tables in one transaction. V1 imports normalize missing strength tables to empty. Validation runs before writes and checks relationships. Replacement restores clear and reinsert all supported tables atomically; failures roll back. The existing safety-download and confirmation flow remains, with a warning about older backups replacing all current workouts. Download retention cannot be guaranteed by browser APIs.

The previously implemented safe-update gate protects unsaved foundation drafts. Storage persistence is browser-controlled, and the last download-request timestamp remains a small device-local preference. Backups remain necessary. Multiple-copy conflict management is deferred.

97 tests cover the data foundation, exercise library and workout logging. Library seeding is transactional and adds only missing fixed IDs. Custom creation validates the existing model before writing; all exercises remain covered by v2 backup validation. Library and Data & settings are mutually exclusive screens, so one editor owns the update-safety gate at a time. Navigation checks the same dirty/busy flags before leaving. The update panel remains mounted across screens. The workout hub delegates safety ownership to its active editor while a workout is open. Serialized autosave queues preserve raw set drafts and workout metadata; explicit set commits apply validated performance. Workout mutations read/validate the affected graph and write only changed rows transactionally. Other session records and library definitions remain untouched. History is read-only. Timer controls, superset UI and analytics remain deferred.

## App shell (0.5.0)

The shell has four hash-based destinations: Train, History, Library and Settings. Hash navigation works on GitHub Pages and offline without server routing. Existing unsaved-change and in-progress-operation guards protect navigation. A resume strip opens the unfinished workout from other destinations.

Shared semantic CSS tokens define colour, typography, spacing and surfaces; shared buttons, icons, headers and bottom navigation establish the visual foundation. Light is the current presentation. Dark reference tokens prepare future themes without exposing a customisation system. Bottom navigation accounts for the iPhone safe area.

Settings places export/restore first, with device storage and development storage records in disclosures. Update registration stays mounted across destinations. Database schema 3 and backup format 2 are unchanged; older backups retain their existing compatibility path. No dependencies or fitness capabilities were added. Set-entry interaction redesign remains a later increment.

## Inline logging (0.6.0)

ActiveWorkout owns an InlineSetStore: raw inputs are keyed by set ID, debounced and written through one serial queue. Blur and completion capture the latest text; structural actions drain the queue first. A newer edit is never replaced by the result of an older write. Valid drafts apply automatically, retaining the current completion state. Invalid drafts persist alongside the last valid measurements and prevent finishing until corrected or reverted. The existing navigation and update safety gate aggregates all rows' unsaved text and in-flight saves.

saveInlineSet saves raw text and validated measurements in one transaction. The incomplete-to-complete transition also creates/replaces the one persisted rest timer, using the session exercise override or historical exercise snapshot default. Corrections to completed measurements keep the original completion timestamp and timer. Timer controls persist deadlines or paused remaining seconds; reopening calculates remaining time from the deadline. Background alarms are not guaranteed by an iPhone PWA.

Previous performance is a read-only lookup of finished sessions, matched by source exercise ID and compatible tracking configuration, with completed sets matched by type and order in the UI. Cancelled/incomplete sets are excluded. Copying converts units and leaves the current set incomplete unless it was already completed. No schema or backup-format migration is required. Other fitness capabilities are unchanged.
