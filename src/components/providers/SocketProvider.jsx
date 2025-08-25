'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeDeptId, setActiveDeptId] = useState(null)
  const [timetables, setTimetables] = useState({})
  const activeDeptRef = useRef(null)

  // Restore last selected department on mount
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('activeDeptId') : null
      if (saved) {
        activeDeptRef.current = saved
        setActiveDeptId(saved)
      }
    } catch {}
  }, [])

  useEffect(() => {
    // Allow engine.io to choose the best transport (polling -> websocket).
    // Add reconnection options and useful logging to debug disconnects.
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // transports: ['websocket']
    })
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setIsConnected(true)
      // eslint-disable-next-line no-console
      console.info('Socket connected', socketInstance.id)
      if (activeDeptRef.current) {
        try {
          socketInstance.emit('dept:join', { deptId: activeDeptRef.current })
          socketInstance.emit('timetable:fetch', { deptId: activeDeptRef.current }) // proactively request latest
        } catch {}
      }
    })

    socketInstance.on('connect_error', (err) => {
      setIsConnected(false)
      // eslint-disable-next-line no-console
      console.error('Socket connect_error', err)
    })

    socketInstance.on('reconnect', (attempt) => {
      // eslint-disable-next-line no-console
      console.info('Socket reconnected after attempts:', attempt)
    })

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false)
      // eslint-disable-next-line no-console
      console.warn('Socket disconnected:', reason)
    })

    socketInstance.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Socket error:', err)
    })

    // Timetable events
    socketInstance.on('timetable:updated', ({ deptId, timetable }) => {
      setTimetables((prev) => ({ ...prev, [deptId]: timetable }))
    })

    socketInstance.on('timetable:cleared', ({ deptId }) => {
      setTimetables((prev) => {
        const next = { ...prev }
        delete next[deptId]
        return next
      })
    })

    socketInstance.on('timetable:not-found', ({ deptId }) => {
      setTimetables((prev) => {
        const next = { ...prev }
        delete next[deptId]
        return next
      })
    })

    // Periodic keepalive
    let keepaliveTimer = null
    const startKeepalive = () => {
      if (keepaliveTimer) return
      keepaliveTimer = setInterval(() => {
        try { socketInstance.emit('keepalive') } catch (e) {}
      }, 20000)
    }

    socketInstance.on('connect', startKeepalive)
    socketInstance.on('disconnect', () => {
      if (keepaliveTimer) { clearInterval(keepaliveTimer); keepaliveTimer = null }
    })

    return () => {
      socketInstance.removeAllListeners()
      socketInstance.disconnect()
    }
  }, [])

  // Fetch latest timetable via HTTP as a fallback (and can be called on-demand)
  const refreshTimetable = async (deptIdArg) => {
    const dept = deptIdArg || activeDeptRef.current
    if (!dept) return null
    try {
      const res = await fetch(`/api/timetable?deptId=${encodeURIComponent(dept)}`)
      if (res.ok) {
        const timetable = await res.json()
        setTimetables((prev) => ({ ...prev, [dept]: timetable }))
        return timetable
      }
      if (res.status === 404) {
        setTimetables((prev) => {
          const next = { ...prev }
          delete next[dept]
          return next
        })
        return null
      }
    } catch {}
    return null
  }

  const clearTimetableCache = (deptIdArg) => {
    const dept = deptIdArg || activeDeptRef.current
    if (!dept) return
    setTimetables((prev) => {
      const next = { ...prev }
      delete next[dept]
      return next
    })
  }

  // Select or change the active department
  const selectDepartment = (deptId) => {
    const prev = activeDeptRef.current
    if (socket?.connected) {
      if (prev && prev !== deptId) {
        try { socket.emit('dept:leave', { deptId: prev }) } catch {}
      }
      if (deptId) {
        try {
          socket.emit('dept:join', { deptId })
          socket.emit('timetable:fetch', { deptId }) // request latest for this dept
        } catch {}
      }
    }
    activeDeptRef.current = deptId || null
    setActiveDeptId(deptId || null)
    try {
      if (deptId) localStorage.setItem('activeDeptId', deptId)
      else localStorage.removeItem('activeDeptId')
    } catch {}
    // Fallback to HTTP fetch in case socket doesn't return anything
    if (deptId) refreshTimetable(deptId)
  }

  // Current department’s timetable or null
  const activeTimetable = activeDeptId ? (timetables[activeDeptId] ?? null) : null

  // Minimal helper to upload an Excel file (admin UI can call this).
  // Server should process, persist, and broadcast 'timetable:updated' to the department room.
  const uploadTimetable = async (deptId, file) => {
    if (!deptId || !file) throw new Error('deptId and file are required')
    const form = new FormData()
    form.append('deptId', deptId)
    form.append('file', file) // Excel file (e.g., .xlsx)
    const res = await fetch('/api/timetable/upload', { method: 'POST', body: form })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || 'Failed to upload timetable')
    }
    return res.json().catch(() => ({}))
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected: isConnected,
        activeDeptId,
        selectDepartment,
        timetables,
        activeTimetable,
        uploadTimetable,
        refreshTimetable,
        clearTimetableCache
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}