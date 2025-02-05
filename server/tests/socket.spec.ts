import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from 'vitest'
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import logger from '@server/utils/logger/logger'
import { setupSocket, socketIO } from '@server/socket'

vi.mock('socket.io', () => {
  const mOn = vi.fn()
  const mSocketIO = vi.fn().mockImplementation(() => {
    return {
      on: mOn,
    }
  })

  return {
    Server: mSocketIO,
  }
})

vi.mock('@server/utils/logger/logger', () => {
  return {
    default: {
      info: vi.fn(),
    },
  }
})

describe('setupSocket', () => {
  let httpServer: HttpServer

  beforeEach(() => {
    httpServer = new HttpServer()
    vi.clearAllMocks()
  })

  afterEach(() => {
    socketIO.io = undefined
  })

  it('should instantiate SocketIOServer with correct options', () => {
    setupSocket(httpServer)

    const socketIOConstructorMock = SocketIOServer as unknown as Mock

    expect(socketIOConstructorMock).toHaveBeenCalledWith(httpServer, {
      path: '/api/sockets',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    expect(socketIO.io).toBeDefined()
  })

  it('should register a connection event handler that logs connections', () => {
    setupSocket(httpServer)

    const socketIOConstructorMock = SocketIOServer as unknown as Mock
    const socketIoInstance = socketIOConstructorMock.mock.results[0].value

    expect(socketIoInstance.on).toHaveBeenCalledWith(
      'connection',
      expect.any(Function)
    )
  })

  it('should log on client connection and disconnection', () => {
    setupSocket(httpServer)

    const socketIOConstructorMock = SocketIOServer as unknown as Mock
    const socketIoInstance = socketIOConstructorMock.mock.results[0].value

    const connectionCallback = socketIoInstance.on.mock.calls.find(
      ([eventName]: [string]) => eventName === 'connection'
    )?.[1]

    const mockSocket = {
      on: vi.fn(),
    }

    if (connectionCallback) {
      connectionCallback(mockSocket)
    }

    expect(logger.info).toHaveBeenCalledWith('client connected via Socket.IO')
    expect(mockSocket.on).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    )

    const disconnectCallback = mockSocket.on.mock.calls.find(
      ([eventName]: [string]) => eventName === 'disconnect'
    )?.[1]

    if (disconnectCallback) {
      disconnectCallback()
    }

    expect(logger.info).toHaveBeenCalledWith('client disconnected')
  })
})
