import createApp from '@server/app'
import supertest from 'supertest'
import { createTestDatabase } from './utils/database'

let database: ReturnType<typeof createTestDatabase>
let app: ReturnType<typeof createApp>

beforeAll(() => {
  database = createTestDatabase()
  app = createApp(database)
})

afterAll(async () => {
  await database.destroy()
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('App test', () => {
  it('returns 404 for unknown routes', async () => {
    await supertest(app).get('/api/unknown-route').expect(404)
  })

  it('includes CORS headers', async () => {
    const res = await supertest(app).options('/api/health')
    expect(res.header['access-control-allow-origin']).toBe('*')
  })

  it('can launch the app', async () => {
    await supertest(app).get('/api/health').expect(200, 'OK')
  })
})
