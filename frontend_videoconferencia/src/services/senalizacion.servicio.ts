import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function obtenerSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, { autoConnect: false })
  }

  return socket
}

export function cerrarSocket(): void {
  socket?.disconnect()
  socket = null
}
