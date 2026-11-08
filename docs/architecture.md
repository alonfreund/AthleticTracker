# Foundation architecture

React screens call repository operations; domain rules remain independent from UI and storage. Dexie database v2 retains v1 metadata and adds foundationRecords keyed by UUID with an updatedAt index. Explicit Save commits before success feedback. Drafts stay in memory on save failure; the UI discourages accidental navigation, but closing/termination may lose unsaved drafts.

Backups use a separate versioned format. Export reads both tables within one readonly transaction. Parsing reconstructs validated values; it never treats the JSON as executable code. Restore validates before opening a single readwrite transaction that compares the safety snapshot, clears tables and inserts replacements. Any write failure aborts the transaction. The UI requires a safety download attempt and explicit acknowledgement. Download completion/retention cannot be guaranteed by browser APIs.

Full replacement only; no merge, encryption, cloud storage, fitness schema, native sensor integration or background tracking. Keep deployment origin stable and backups outside browser storage. Future schema additions must extend both backup validation and transaction coverage, with backward-compatible import migrations.

Tests use Vitest and fake-indexeddb for save/reopen, migration, validation, round-trip and rollback coverage. Browser verification covers the visible flow. Actual iPhone installation/offline verification remains a separate HTTPS deployment step.
