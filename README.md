# AthleticTracker

Local-only React + TypeScript PWA foundation. No fitness features, accounts, backend, analytics services or deployment have been added.

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

Open the printed preview URL online and wait for “Available offline on this device”. Offline caching is disabled in the development server. Use browser offline mode and reload the production preview to check caching. iPhone installation requires a reachable HTTPS host; a Mac's ordinary LAN HTTP address is insufficient. Nothing is published yet.

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

IndexedDB stores data; the service worker separately caches application files. The initial database only contains a creation timestamp. Browser storage is device/origin-specific and can be cleared. Backup/restore is not implemented. No important training data should be stored yet.

Updates prompt for reload rather than activating automatically. Schema upgrades must preserve records. Keep deployment origins stable; use export/restore before moving addresses. Production output is `dist/`. No external fonts or runtime services are used.

## Version control

A local Git repository is initialized on `main`. No remote is configured. Commit source and `package-lock.json`; never commit `.tools`, `node_modules`, or `dist`. On a different Mac, install a compatible Node LTS and run `npm ci`.
