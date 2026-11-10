# iPhone installation and offline foundation test

## Hosting setup

The repository must be named `AthleticTracker` to match Vite's `/AthleticTracker/` base path. Create a public GitHub repository and select Settings → Pages → Build and deployment → Source → GitHub Actions. Push `main`; the Test and deploy GitHub Pages workflow installs locked dependencies, runs tests, builds, and deploys only `dist`. The included github.io HTTPS address needs no paid domain or Apple membership. No credentials belong in source or backup files.

The GitHub integration/CLI may need repository and workflow permissions to publish. Sign in through GitHub's own flow; never paste passwords or tokens into chat. The workflow uses GitHub's temporary token; no manual secret is required. Use standard GitHub-hosted runners only, without a paid plan or custom domain.

## Install

1. Wait for successful deployment; use the exact HTTPS URL ending in `/AthleticTracker/`.
2. Open it in Safari, use Share → Add to Home Screen (Open as Web App if shown), then launch the new icon.
3. While online, wait for “Local database ready” and “Available offline on this device”. Do this from the Home Screen app, even if you already visited it in Safari.

## Verify with disposable records

1. Save a test record such as “Offline test A”; wait for “Saved to this device”.
2. Close the app, enable airplane mode and disable Wi-Fi, then reopen from the Home Screen. Confirm the saved record remains.
3. Create and save another record offline, close and reopen, and confirm both remain.
4. Export a JSON backup. Save it in Files → On My iPhone for the offline test; an iCloud-only file may be unavailable while offline.
5. Edit and save a record. Select the earlier backup from Files, review the replacement summary, download and keep the safety backup, acknowledge replacement, and press Replace data with backup.
6. Confirm the exported text returns, then close and reopen once more. The restored records should remain.
7. Reconnect. If “Reload to update” appears in future, save or discard drafts before accepting it.

Do not delete the Home Screen app or clear website data to test reopening. Those actions can remove local data. Local Mac data is not transferred by publishing; export/import is needed to move it. Backups are unencrypted. Keep the hosting address stable: storage is tied to the origin. GitHub Pages projects on the same github.io origin are not separate browser security boundaries; use a dedicated origin if publishing other untrusted apps later.

## If something fails

Record the iPhone model, iOS version, exact failing step and visible error (without sharing private backup contents). Initial installation and updates need internet; normal foundation saving/export/restore should work offline. Browser storage is not guaranteed permanent; keep backups outside it.

## Inline logging and rest timers (0.6.0)

1. Save drafts and export a backup before updating. In Settings → About & updates, check and apply the update. Confirm version 0.6.0.
2. Start/resume a strength workout. Add Barbell bench press. Tap its weight and reps cells directly, enter values and tap the round completion control. Expect a checked, tinted row and a rest timer. There is no separate editor.
3. Pause, adjust, resume and skip rest. Add another set. Tap its set-type selector to choose warm-up/drop set/etc. Details exposes optional RPE/RIR, duration and units. Correct a completed row and confirm the timer does not restart.
4. Enter a partial number such as `.` in an incomplete row. Wait for “Changes pending” (the raw draft is saved). Reopen offline, resume and confirm the text remains. Correct or revert pending edits before finishing.
5. Finish a workout with completed sets. Start another with the same exercise: Previous shows the completed performance. Tap it to copy values; the row remains incomplete until checked. Warm-ups match warm-ups, and working sets match their own types.
6. In Airplane Mode, repeat set entry and completion, reopen/resume, then export a backup. Restore it using the existing safety-backup/review flow. Confirm history, unfinished values and paused/running timer state are preserved.

Check the numeric keyboard and visibility of focused fields on the physical iPhone. Background alarms are not guaranteed while iOS suspends the PWA; the deadline still recovers on return.
