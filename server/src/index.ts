import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import createApp from './app'
import { createDatabase } from './database'
import config from './config'
import logger from '@server/utils/logger/logger'

const database = createDatabase(config.database)

const app = createApp(database)

const httpServer = createServer(app)

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  logger.info('A client connected via Socket.IO')

  socket.on('disconnect', () => {
    logger.info('A client disconnected')
  })
})

httpServer.listen(config.port, () => {
  logger.info(`Server is running at http://localhost:${config.port}`)
})
