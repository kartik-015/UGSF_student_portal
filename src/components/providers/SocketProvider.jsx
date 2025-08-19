'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)

  // Track the active department and timetables by department.
  const [activeDeptId, setActiveDeptId] = useState(null)
  const [timetables, setTimetables] = useState({}) // { [deptId]: timetableData }
  const activeDeptRef = useRef(null)

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
      // eslint-disable-next-line no-console
      console.info('Socket connected', socketInstance.id)
      // Re-join the active department room on reconnect so timetable events resume.
      if (activeDeptRef.current) {
        try { socketInstance.emit('dept:join', { deptId: activeDeptRef.current }) } catch (_) {}
      }
    })

    socketInstance.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Socket connect_error', err)
    })

    socketInstance.on('reconnect', (attempt) => {
      // eslint-disable-next-line no-console
      console.info('Socket reconnected after attempts:', attempt)
    })

    socketInstance.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.warn('Socket disconnected:', reason)
    })

    socketInstance.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Socket error:', err)
    })

    // Timetable events (server should emit these to the department room)
    socketInstance.on('timetable:updated', ({ deptId, timetable }) => {
      // Store/update the department’s timetable. UI shows nothing if absent.
      setTimetables((prev) => ({ ...prev, [deptId]: timetable }))
    })

    socketInstance.on('timetable:cleared', ({ deptId }) => {
      // Remove timetable so the UI shows nothing by default.
      setTimetables((prev) => {
        const next = { ...prev }
        delete next[deptId]
        return next
      })
    })

    socketInstance.on('timetable:not-found', ({ deptId }) => {
      // Explicitly ensure nothing is shown if server reports missing timetable.
      setTimetables((prev) => {
        const next = { ...prev }
        delete next[deptId]
        return next
      })
    })

    // Periodic keepalive to help with proxies / NAT timeouts
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

  // Select or change the active department. Joins/leaves rooms as needed.
  const selectDepartment = (deptId) => {
    const prev = activeDeptRef.current
    if (socket?.connected) {
      if (prev && prev !== deptId) {
        try { socket.emit('dept:leave', { deptId: prev }) } catch (_) {}
      }
      if (deptId) {
        try { socket.emit('dept:join', { deptId }) } catch (_) {}
      }
    }
    activeDeptRef.current = deptId || null
    setActiveDeptId(deptId || null)
    // Do not force-clear cached timetables; UI can still read historical for other depts if needed.
    // The "active" view should use activeTimetable below which returns null when absent.
  }

  // Current department’s timetable or null (UI shows nothing by default).
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
        // existing
        socket,
        connected: !!socket?.connected,
        // new
        activeDeptId,
        selectDepartment,
        timetables,
        activeTimetable,
        uploadTimetable
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