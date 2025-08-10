import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const day = searchParams.get('day') || 'monday'

    // Mock timetable data - in a real implementation, you would query the database
    const mockTimetable = [
      {
        _id: '1',
        day: 'monday',
        startTime: '09:00',
        endTime: '10:00',
        subject: {
          _id: '1',
          code: 'CS301',
          name: 'Data Structures'
        },
        faculty: {
          _id: '1',
          academicInfo: {
            name: 'Dr. John Smith'
          }
        },
        room: 'Room 101'
      },
      {
        _id: '2',
        day: 'monday',
        startTime: '10:00',
        endTime: '11:00',
        subject: {
          _id: '2',
          code: 'CS302',
          name: 'Database Systems'
        },
        faculty: {
          _id: '1',
          academicInfo: {
            name: 'Dr. John Smith'
          }
        },
        room: 'Room 102'
      },
      {
        _id: '3',
        day: 'monday',
        startTime: '11:15',
        endTime: '12:15',
        subject: {
          _id: '3',
          code: 'IT301',
          name: 'Web Development'
        },
        faculty: {
          _id: '2',
          academicInfo: {
            name: 'Dr. Jane Doe'
          }
        },
        room: 'Lab 201'
      },
      {
        _id: '4',
        day: 'tuesday',
        startTime: '09:00',
        endTime: '10:00',
        subject: {
          _id: '1',
          code: 'CS301',
          name: 'Data Structures'
        },
        faculty: {
          _id: '1',
          academicInfo: {
            name: 'Dr. John Smith'
          }
        },
        room: 'Room 101'
      },
      {
        _id: '5',
        day: 'wednesday',
        startTime: '14:00',
        endTime: '15:00',
        subject: {
          _id: '2',
          code: 'CS302',
          name: 'Database Systems'
        },
        faculty: {
          _id: '1',
          academicInfo: {
            name: 'Dr. John Smith'
          }
        },
        room: 'Room 102'
      }
    ]

    // Filter by day
    const timetable = mockTimetable.filter(item => item.day === day)

    return NextResponse.json({ 
      timetable,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching timetable:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'faculty'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    await dbConnect()

    const body = await request.json()
    const { subjectId, day, startTime, endTime, room } = body

    // Validate required fields
    if (!subjectId || !day || !startTime || !endTime) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate subject exists and faculty has access
    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 })
    }

    if (session.user.role === 'faculty' && subject.faculty?.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Access denied to this subject' }, { status: 403 })
    }

    // In a real application, this would save to a Timetable model
    // For now, we'll return a success response
    const timetableEntry = {
      _id: `timetable_${subjectId}_${day}`,
      subject: subject,
      faculty: subject.faculty,
      day: day,
      startTime: startTime,
      endTime: endTime,
      room: room || 'TBA',
    }

    return NextResponse.json({ 
      message: 'Timetable entry created successfully',
      timetableEntry
    }, { status: 201 })

  } catch (error) {
    console.error('Timetable POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

