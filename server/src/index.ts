import { createServer } from 'http'
import createApp from './app'
import { createDatabase } from './database'
import config from './config'
import logger from '@server/utils/logger/logger'
import { setupSocket } from './socket'

const database = createDatabase(config.database)
const app = createApp(database)
const httpServer = createServer(app)

setupSocket(httpServer)

httpServer.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server is running at http://localhost:${config.port}`)
})

export default app
