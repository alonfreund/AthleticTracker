# AthleticTracker

Local-only React + TypeScript PWA foundation. Includes disposable storage-test records and versioned JSON export/restore. No fitness features, accounts, backend or analytics services have been added. GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.

## Development

Node.js 24 LTS is installed locally in `.tools/node` (ignored by Git). In a terminal opened in this folder:

```bash
export PATH="$PWD/.tools/node/bin:$PATH"
npm ci
npm run dev
```

Open the printed localhost address. Stop with Control-C. Node is only a development tool; the installed phone app does not need it.

## Production and offline preview

```bash
npm run build
npm run preview
```

Open the printed preview URL online and wait for “Available offline on this device”. Offline caching is disabled in the development server. Use browser offline mode and reload the production preview to check caching. iPhone installation requires a reachable HTTPS host; a Mac's ordinary LAN HTTP address is insufficient. Publication requires a public GitHub repository and Pages configured for GitHub Actions; see `docs/iphone-testing.md`.

## Architecture

- `src/app`: startup UI and PWA status
- `src/domain`: future training rules and data types
- `src/features`: future feature modules
- `src/data/db`: Dexie schema and transactional setup metadata
- `src/data/repositories`: future data access operations
- `src/data/backup`: future validated export/restore
- `src/components`: shared UI
- `src/styles`: styles
- `public/icons`: bundled install icons
- `docs`: architecture notes

IndexedDB stores data; the service worker separately caches application files. Database version 2 preserves the original creation timestamp and adds foundationRecords (id, text, createdAt, updatedAt). Records are disposable foundation tests, not workout data. Browser storage is device/origin-specific and can be cleared. Keep JSON backups outside the app; files are unencrypted. No important training data should be stored yet.

Updates prompt for reload rather than activating automatically. Schema upgrades must preserve records. Keep deployment origins stable; use export/restore before moving addresses. Production output is `dist/`. No external fonts or runtime services are used.

## Version control

A local Git repository is initialized on `main`. A GitHub remote will be configured during first publication. Commit source and `package-lock.json`; never commit `.tools`, `node_modules`, or `dist`. On a different Mac, install a compatible Node LTS and run `npm ci`.

## Foundation verification

```bash
npm test
npm run build
```

Vitest and fake-indexeddb are development-only dependencies. Tests cover reopening, v1-to-v2 upgrades, save failures, JSON round trips, replacement, invalid backups, transaction rollback, and changes since the safety snapshot.

In the production preview, save a disposable record and reload. Export, edit/save it, select the exported file, review the replacement summary, download and keep the safety backup, acknowledge replacement, then restore. The original exported text should return. Unsaved drafts are not exported; save or discard them first.

The current backup format is `athletic-tracker-backup`, formatVersion 1, with exportedAt, appVersion and data containing metadata and foundationRecords arrays. Validation rejects unsupported versions, extra/missing fields, invalid dates, invalid/duplicate identifiers and files over 10 MB. The 10 MB limit is specific to this foundation version and must be revisited before larger real datasets. Export/restore work locally without network requests. A download request cannot prove that the user retained the file.

Restore replaces both tables in one transaction. A failure rolls back all changes. Changes made after the safety snapshot block restore; cancel and restart the flow. Avoid editing in other tabs during restore; a write made after restore completes is a separate operation. There is no automatic cross-tab UI refresh or device sync.

For device verification, an actual iPhone and HTTPS deployment are still required. Fake IndexedDB tests do not prove browser durability under power loss, storage eviction, or OS termination. Browser save confirmation means the storage transaction committed, not a permanent backup.

## GitHub Pages

The deployment base path is `/AthleticTracker/`. Use that path when opening local development or preview. The workflow runs on pushes to `main` and can be started manually in Actions. It runs tests before deploying and uses Node 24. See [iPhone testing instructions](docs/iphone-testing.md). Publishing moves application files only, not local records.

## Safe updates (0.1.0)

App version comes from package.json at build time and is also included in new backups. Check for updates requires internet; a waiting update does not automatically reload. Drafts, operations, initial record loading and restore reviews block activation. Editors are disabled during an approved update. Activation rechecks safety; another open copy cannot cause an automatic reload here. Failed/timed-out updates release the controls and show an error. Unsaved drafts are memory-only and cannot survive all OS termination/manual reload events.

See [the staged iPhone update test](docs/update-testing.md). Load 0.1.0 before publishing the next test version. The local two-build browser test confirmed a disabled update button with an intact draft, then a successful reload with both saved records retained. Automated checks now include 17 tests. No schema or backup-format change was needed.

## Storage protection and backup status (0.1.2)

The app requests persistent browser storage when supported, and displays granted, not granted, unsupported or unavailable. A retry button is available after denial/failure. This is browser-controlled protection against automatic eviction, not protection against deletion or device loss.

The backup panel displays the last backup-download request on this device, including safety backups. Its single timestamp is stored in localStorage as a small preference, separate from IndexedDB records and JSON backups. It does not prove the file was retained or covers later edits; restoring a backup does not rewrite this device's download history. Downloads still work if history storage fails. No dependencies, database schema changes or new conflict management were added.

Backup format v1 and database schema v2 are unchanged. Export validates and checks the 10 MB limit before requesting a download; import validates before replacing tables in one transaction. Keep `tests/fixtures/backup-v1-*` as fixed representative files matching earlier releases. When adding tables or backup versions, extend import conversion and compatibility tests rather than rewriting these fixtures. Current suite: 27 tests, including legacy restore/re-export, empty backups, invalid files and rollback. No distinct older backup format existed before v1; no speculative migrations were introduced.

## Strength data foundation (0.2.0)

Database schema v3 adds structured strength tables without changing existing records. Backup format v2 includes those tables, unfinished set drafts, timers and full exercise snapshots; old v1 backups are still accepted with empty strength data. Restoring v1 replaces all data and removes any newer workouts. New v2 files require app 0.2.0 or later. Back up before upgrading and avoid downgrading the app against the newer database.

No workout logging screens, catalog seeding, cardio, routines, programmes or analytics are included in this increment. See [the model, rules and test coverage](docs/strength-data-model.md). All 59 tests pass; a local browser update from 0.1.2 preserved a saved record. Future logging operations must enforce the same relationships transactionally.
