self.addEventListener('push', event => {
  event.waitUntil(self.registration.showNotification('Rest complete', {
    body: 'Ready for your next set.',
    icon: new URL('icons/icon-192.png', self.registration.scope).href,
    tag: 'athletic-tracker-rest',
  }))
})

self.addEventListener('notificationclick', event => {
  if (event.notification.tag !== 'athletic-tracker-rest') return
  event.notification.close()
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = windows.find(client => client.url.startsWith(self.registration.scope))
    if (existing) await existing.focus()
    else await self.clients.openWindow(self.registration.scope)
  })())
})
