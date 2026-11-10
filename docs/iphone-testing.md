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

## Rest preferences and drag handles (0.7.0)

1. Export a backup, update to 0.7.0 and set Settings → Rest preferences to 1 minute 17 seconds. Save, leave Settings and return: expect 1:17.
2. In a workout, expand an exercise's Rest control. Enter 1 minute 23 seconds and Save exercise default. Complete a set: expect a 1:23 timer. Pause it, open Set exact remaining time and apply 0:47: the paused timer changes to 0:47 while the exercise header remains 1:23. ±15s affects only this timer.
3. Finish the workout and add the exercise to a new workout. Expect 1:23 automatically. Choose Use global default for this exercise: expect 1:17. Global applies only to exercises without a saved exercise default; existing starter defaults remain until you change/reset them. Test 0:00 to turn rest off.
4. Add at least three exercises, with some logged values and an unfinished partial draft. Hold the ⠿ handle for a quarter-second, then drag. Expect a highlighted floating label, a visible placeholder and cards moving aside. Drag near the screen edge to check auto-scrolling. Release to save. Scroll on the card away from the handle: it must not reorder. Test a very tall card as well.
5. Reopen in Airplane Mode: expect order, values, drafts and rest preferences intact. Reorder and edit rest while offline. Start a running timer, close for 15 seconds and reopen: remaining time should reflect elapsed time rather than restart. Background alarms are not guaranteed.
6. Choose every set type. Expect yellow W, red F, light-blue D, green A, purple B, neutral normal. Finish and open history: named badges must use the same colours. Dark tokens are prepared and contrast-tested, but there is no new theme switch.
7. Export/restore while offline. New format-3 backups should retain global and exercise defaults, order and unfinished data. Keep the safety backup. Old formats 1/2 remain importable; an older backup without the global setting uses 1:30 after restore. Avoid testing an older backup against real data without first keeping a current backup.

Physical iPhone acceptance: confirm hold-to-drag, edge scrolling, numeric keyboard visibility and returning from app suspension. Desktop/browser checks cannot certify Safari touch behaviour on the device.

## Catalogue foundation (0.8.0)

1. Before updating, export a backup and note an exercise's saved rest setting, a finished workout and any unfinished set draft. Keep the backup outside the app.
2. Update via Settings → About & updates and confirm 0.8.0. Resume the draft: expect identical raw text, values, order and timer state. View the old workout: its exercise name/instructions/tracking snapshot must be unchanged.
3. Open Library: expect the same twelve built-ins, plus your custom exercises. Search `RDL` to find Romanian deadlift. Details now show exercise type, movement patterns, aliases and repetition convention. A missing legacy repetition convention says Not specified rather than reinterpreting old repetitions.
4. Check saved rest in exercise details and add that exercise to a new workout. Expect the same personal duration. Saving a new duration must not change old workout snapshots.
5. Create one disposable custom exercise. Optional classification supports aliases, movement patterns, repetition convention and variant notes. Reopen offline and confirm details and rest persist. No full favourites/filter UI is introduced in this increment.
6. Export a current backup and use the existing safety-backup/review flow to restore it. Confirm custom metadata, personal rest, workouts and drafts. New files are format 4 and require the updated app. Older formats 1–3 still import and migrate; replacement still replaces all current data.

Physical-device update/restore testing is recommended before expanding catalogue content. Do not clear site data to troubleshoot an update; use backups to protect your local records.
