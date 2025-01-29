import express from 'express'
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express'
import cors from 'cors'
import { renderTrpcPanel } from 'trpc-panel'
import type { Database } from './database'
import { appRouter } from './controllers'
import type { Context } from './trpc'
import config from './config'

// 1) Import the HTTP and Socket.IO modules
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Export 'io' so other files can import it
export let io: SocketIOServer | null = null

export default function createApp(db: Database) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use('/api/health', (_, res) => {
    res.status(200).send('OK')
  })

  app.use(
    '/api/v1/trpc',
    createExpressMiddleware({
      createContext: ({ req, res }: CreateExpressContextOptions): Context => ({
        db,
        req,
        res,
      }),
      router: appRouter,
    })
  )

  if (config.env === 'development') {
    app.use('/api/v1/trpc-panel', (_, res) =>
      res.send(
        renderTrpcPanel(appRouter, {
          url: `http://localhost:${config.port}/api/v1/trpc`,
          transformer: 'superjson',
        })
      )
    )
  }

  // 2) Create an HTTP server from the express app
  const httpServer = createServer(app)

  // 3) Initialize Socket.IO with the HTTP server and store in 'io'
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // 4) Listen for WebSocket connections
  io.on('connection', (socket) => {
    console.log('A client connected via Socket.IO')

    socket.on('disconnect', () => {
      console.log('A client disconnected')
    })
  })

  return httpServer
}
