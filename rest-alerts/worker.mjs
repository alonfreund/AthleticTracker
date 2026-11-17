import webpush from 'web-push'

const tokenPattern = /^[a-f0-9]{64}$/
const maxRestMillis = 7 * 24 * 60 * 60 * 1000

function validEndpoint(value) {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'web.push.apple.com' &&
      !url.port && !url.username && !url.password && !url.hash && url.pathname.length > 1
  } catch {
    return false
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.headers.get('Origin') !== env.APP_ORIGIN) return new Response(null, { status: 403 })
    const cors = {
      'Access-Control-Allow-Origin': env.APP_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    }
    const reply = (status, body = null) => new Response(body, { status, headers: cors })
    if (request.method === 'OPTIONS') return reply(204)
    if (request.method === 'GET' && url.pathname === '/key') return reply(200, env.VAPID_PUBLIC_KEY)
    if (request.method !== 'POST' || url.pathname !== '/timer') return reply(404)
    const { success } = await env.REQUEST_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' })
    if (!success) return reply(429)
    if (Number(request.headers.get('Content-Length')) > 4096) return reply(413)
    const reader = request.body?.getReader()
    if (!reader) return reply(400)
    const decoder = new TextDecoder()
    let input = ''
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 4096) { await reader.cancel(); return reply(413) }
      input += decoder.decode(value, { stream: true })
    }
    let data
    try { data = JSON.parse(input + decoder.decode()) } catch { return reply(400) }
    const now = Date.now()
    if (!data || typeof data.token !== 'string' || !tokenPattern.test(data.token) ||
      !Number.isSafeInteger(data.revision) || data.revision < 1 ||
      (data.deadline !== null && (!Number.isSafeInteger(data.deadline) ||
        data.deadline > now + maxRestMillis || !validEndpoint(data.endpoint)))) return reply(400)
    const response = await env.TIMERS.getByName(data.token).fetch('https://timer.internal/', {
      method: 'POST', body: JSON.stringify({ revision: data.revision, deadline: data.deadline, endpoint: data.endpoint }),
    })
    return reply(response.status)
  },
}

export class RestAlert {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  async fetch(request) {
    const { revision, deadline, endpoint } = await request.json()
    const storage = this.state.storage
    const previous = await storage.get('revision')
    if (revision <= (previous ?? 0)) return new Response(null, { status: 204 })
    await storage.put('revision', revision)
    if (deadline === null || deadline <= Date.now()) {
      await storage.delete('timer')
      await storage.deleteAlarm()
    } else {
      await storage.put('timer', { deadline, endpoint })
      await storage.setAlarm(deadline)
    }
    return new Response(null, { status: 204 })
  }

  async alarm() {
    const storage = this.state.storage
    const timer = await storage.get('timer')
    if (!timer || timer.deadline > Date.now()) return
    if (Date.now() - timer.deadline <= 15000) {
      const { endpoint, headers } = webpush.generateRequestDetails({ endpoint: timer.endpoint }, null, {
        TTL: 10, urgency: 'high', topic: 'athletic-tracker-rest',
        vapidDetails: { subject: this.env.APP_ORIGIN, publicKey: this.env.VAPID_PUBLIC_KEY, privateKey: this.env.VAPID_PRIVATE_KEY },
      })
      const response = await fetch(endpoint, { method: 'POST', headers, redirect: 'error', signal: AbortSignal.timeout(5000) })
      if (response.status >= 500) throw new Error('Push delivery temporarily unavailable.')
    }
    // A newer alarm can be written while the push request is in flight.
    await storage.transaction(async transaction => {
      const current = await transaction.get('timer')
      if (current?.deadline === timer.deadline && current.endpoint === timer.endpoint) await transaction.delete('timer')
    })
  }
}
