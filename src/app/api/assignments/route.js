import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
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
    const subject = searchParams.get('subject')
    const role = session.user.role

    let query = {}
    
    // Filter by subject if provided
    if (subject) {
      query.subject = subject
    }

    // Role-based filtering
    if (role === 'faculty') {
      query.faculty = session.user.id
    } else if (role === 'student') {
      // For students, show assignments from their subjects
      // This would need to be enhanced based on student enrollment
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'code name')
      .populate('faculty', 'academicInfo.name')
      .sort({ createdAt: -1 })

    return NextResponse.json({ 
      assignments,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subject, dueDate, maxMarks } = body

    if (!title || !description || !subject || !dueDate || !maxMarks) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const assignment = new Assignment({
      title,
      description,
      subject,
      faculty: session.user.id,
      dueDate: new Date(dueDate),
      maxMarks: parseInt(maxMarks)
    })

    await assignment.save()

    return NextResponse.json({ 
      assignment,
      success: true,
      message: 'Assignment created successfully'
    })

  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 