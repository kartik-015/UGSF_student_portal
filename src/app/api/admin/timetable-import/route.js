import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Timetable from '@/models/Timetable'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entries } = body
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Upsert entries by unique key: day + startTime + subjectCode
    const results = []
    for (const e of entries) {
      const filter = { day: e.day, startTime: e.startTime, subjectCode: e.subjectCode }
      const update = {
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        subjectCode: e.subjectCode,
        subjectName: e.subjectName || '',
        facultyId: e.facultyId || null,
        room: e.room || '',
        department: e.department || ''
      }
      const doc = await Timetable.findOneAndUpdate(filter, update, { upsert: true, new: true })
      results.push(doc)
    }

    return NextResponse.json({ success: true, imported: results.length })
  } catch (error) {
    console.error('Timetable import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
