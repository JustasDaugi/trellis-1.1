import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import logger from '@server/utils/logger/logger'

export let io: SocketIOServer | undefined = undefined

export function setupSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    path: '/api/sockets',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    logger.info('client connected via Socket.IO')

    socket.on('disconnect', () => {
      logger.info('client disconnected')
    })
  })
}
