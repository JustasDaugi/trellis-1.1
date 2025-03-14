import { io } from 'socket.io-client'

export const apiOrigin = (import.meta.env.VITE_API_ORIGIN as string) || window.location.origin
export const apiPath = (import.meta.env.VITE_API_PATH as string) || '/api/v1/trpc'
export const apiBase = `${apiOrigin}${apiPath}`

if (typeof apiOrigin !== 'string') {
  throw new Error('VITE_API_ORIGIN is not defined')
}

if (typeof apiPath !== 'string') {
  throw new Error('VITE_API_PATH is not defined')
}

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin

export const socket = io(socketUrl, {
  path: '/api/sockets',
  withCredentials: true,
  transports: ['websocket'],
})

socket.on('connect', () => {
  console.log(`Client connected to Socket.IO server at ${socketUrl}`)
})
