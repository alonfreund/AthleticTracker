# Safe update test on iPhone

## Release stages

0.1.0 is the baseline containing version display and update guards. Do not publish 0.1.1 until the user confirms that their installed Home Screen app is running 0.1.0 with a saved record and an unsaved draft. The local preview test versions 0.1.2 and 0.1.3 were never published.

## Baseline installation

1. In the old Home Screen app, save or intentionally discard every draft. Export a backup and keep it in Files.
2. While online, reopen the app and accept Reload to update if offered. The old release has no safe-update guard: do not use that old button over a draft.
3. Confirm App version 0.1.0, Local database ready and Available offline on this device. Saved records should remain. Do not delete/reinstall or clear website data.
4. Save a new disposable record named “Saved before iPhone update”.
5. Select Discard draft / new record, type “Keep this unsaved draft”, and do not save. Confirm “Unsaved changes — press Save”.
6. Tell the developer the phone is ready for the test update. Keep the Home Screen app open; use another device for chat if convenient. Do not force-close or manually reload it.

## After the test release is published

1. Remain online. Tap Check for updates; wait for the new files to download. The running version remains 0.1.0 until reload.
2. Expect Reload to update to be disabled and “Update paused: Save or discard your unsaved draft before updating.” The draft must stay visible. Finding an update must not automatically reload.
3. Tap Save. Wait for Saved to this device and No unsaved changes. Reload to update becomes enabled.
4. Tap Reload to update. During activation the editor and record controls are locked briefly.
5. Confirm App version 0.1.1. Both “Saved before iPhone update” and “Keep this unsaved draft” must be in the list.
6. Enable airplane mode and disable Wi-Fi; close and reopen. Confirm both saved records remain and the app opens offline. Reconnect afterwards.

If the update has not appeared, check connectivity and tap Check for updates again. Do not clear storage. On an update error, retain the draft and saved records, record the message and report it. Do not force reload to bypass a paused update.

## Boundaries

Unsaved drafts are memory-only; OS termination, force-close, manual navigation or manual reload can lose them. Browser beforeunload prompts are best-effort on iOS. Updates are explicitly requested, never automatic reloads; the safety gate checks loading, drafts, operations and restore review both before activation and before reload. Other app copies can activate a worker, but this version only reloads after its own explicit safe update request. Other older copies without this guard should be closed after saving drafts.

Database schema remains v2 and backup format remains v1. The version in backup appVersion is now generated from package.json. No fitness features or new packages were introduced.
