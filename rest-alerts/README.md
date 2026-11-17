# Rest alerts

The optional iPhone Lock Screen alerts use a Cloudflare Worker and a SQLite-backed Durable Object on the Workers Free plan. The GitHub Pages app still stores workout data on the device. The Worker receives an anonymous device token, a command revision, and, for an active timer, its deadline and Apple push endpoint. It removes the deadline and endpoint after delivery or cancellation.

## Configure

1. On the Workers Free plan, enable a workers.dev subdomain and authorize Wrangler for the hosting account.
2. Install dependencies with `npm ci` in this directory. Run `node --test worker.test.mjs`.
3. Generate a single Web Push VAPID key pair with `npx web-push generate-vapid-keys --json`. Store it outside the repository. Supply the keys to Wrangler as `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` through `wrangler deploy --secrets-file` or the Cloudflare dashboard. Keep the same keys across deployments to preserve subscriptions.
4. Set the GitHub repository's `REST_ALERTS_URL` Actions variable to the deployed HTTPS Worker URL. The Pages workflow provides this value to Vite. A build without the variable omits the alert toggle.

After installing the Pages build on an iPhone Home Screen, enable **Lock Screen rest alerts** in an active rest timer's **Controls** and allow notifications. Test by locking the phone during an online timer. Test again after extending it, pausing and resuming, and skipping. The local workout timer and chime still work independently. A timer change made offline cannot cancel or reschedule an alert already queued on the server until the connection returns.
