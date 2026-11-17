import assert from 'node:assert/strict'
import { test } from 'node:test'
import webpush from 'web-push'
import worker, { RestAlert } from './worker.mjs'

const endpoint = 'https://web.push.apple.com/test-subscription'
const origin = 'https://alonfreund.github.io'
const keys = webpush.generateVAPIDKeys()

function request(body) {
  return new Request('https://worker.example/timer', {
    method: 'POST', body: JSON.stringify(body), headers: { Origin: origin },
  })
}

function setup() {
  const values = new Map()
  let deadline
  const storage = {
    get: async (key) => values.get(key),
    put: async (key, value) => values.set(key, value),
    delete: async (key) => values.delete(key),
    setAlarm: async (time) => { deadline = time },
    deleteAlarm: async () => { deadline = undefined },
    transaction: action => action(storage),
  }
  const timer = new RestAlert({ storage }, { APP_ORIGIN: origin, VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey })
  return { timer, values, alarm: () => deadline }
}

test('adjustments replace scheduled alarms and stale commands cannot recreate a skipped timer', async () => {
  const { timer, alarm, values } = setup()
  const deadline = Date.now() + 60000
  await timer.fetch(request({ revision: 1, deadline, endpoint }))
  assert.equal(alarm(), deadline)
  await timer.fetch(request({ revision: 2, deadline: deadline + 15000, endpoint }))
  assert.equal(alarm(), deadline + 15000)
  await timer.fetch(request({ revision: 3, deadline: null }))
  await timer.fetch(request({ revision: 2, deadline, endpoint }))
  assert.equal(alarm(), undefined)
  assert.equal(values.has('timer'), false)
})

test('a due alarm submits a signed Apple push once and removes the endpoint', async t => {
  const { timer, values } = setup()
  values.set('timer', { endpoint, deadline: Date.now() - 5 })
  const send = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 201 }))
  await timer.alarm()
  await timer.alarm()
  assert.equal(send.mock.callCount(), 1)
  const [url, options] = send.mock.calls[0].arguments
  assert.equal(url, endpoint)
  assert.match(options.headers.Authorization, /^vapid t=/)
  assert.equal(options.headers.TTL, 10)
  assert.equal(values.has('timer'), false)
})

test('the public API accepts Apple subscriptions and rejects arbitrary network destinations', async () => {
  const { timer, alarm } = setup()
  const env = {
    APP_ORIGIN: origin, REQUEST_LIMIT: { limit: async () => ({ success: true }) },
    TIMERS: { getByName: () => ({ fetch: (url, options) => timer.fetch(new Request(url, options)) }) },
  }
  const command = { token: 'a'.repeat(64), revision: 1, deadline: Date.now() + 60000 }
  for (const url of ['https://web.push.apple.com.example.com/token', 'http://web.push.apple.com/token', 'https://127.0.0.1/token']) {
    assert.equal((await worker.fetch(request({ ...command, endpoint: url }), env)).status, 400)
  }
  assert.equal(alarm(), undefined)
  assert.equal((await worker.fetch(request({ ...command, endpoint }), env)).status, 204)
  assert.equal(alarm(), command.deadline)
})
