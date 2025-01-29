import createApp from '@server/app'
import supertest from 'supertest'
import { createTestDatabase } from './utils/database'

const database = createTestDatabase()
const app = createApp(database)

afterAll(() => {
  database.destroy()
})

it.skip('can launch the app', async () => {
  await supertest(app).get('/api/health').expect(200, 'OK')
})
