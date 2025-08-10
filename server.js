const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (room) => {
      socket.join(room)
      console.log(`Client ${socket.id} joined room: ${room}`)
    })

    socket.on('leave-room', (room) => {
      socket.leave(room)
      console.log(`Client ${socket.id} left room: ${room}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Make io available globally for API routes
  global.io = io

  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})

// Helper function to send notifications
global.sendNotification = (userId, notification) => {
  if (global.io) {
    global.io.to(`user-${userId}`).emit('notification', notification)
  }
} 