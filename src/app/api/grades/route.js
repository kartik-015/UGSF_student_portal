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
    const subject = searchParams.get('subject')

    // For now, return mock data since we don't have a grades model yet
    // In a real implementation, you would query the grades collection
    const mockGrades = [
      {
        _id: '1',
        assignment: {
          title: 'Data Structures Assignment #1',
          subject: { code: 'CS301', name: 'Data Structures' }
        },
        marks: 85,
        maxMarks: 100,
        feedback: 'Excellent work! Good understanding of concepts.',
        gradedAt: new Date().toISOString()
      },
      {
        _id: '2',
        assignment: {
          title: 'Database Design Project',
          subject: { code: 'CS302', name: 'Database Systems' }
        },
        marks: 92,
        maxMarks: 100,
        feedback: 'Outstanding database design. Well documented.',
        gradedAt: new Date().toISOString()
      }
    ]

    let grades = mockGrades

    // Filter by subject if provided
    if (subject) {
      grades = grades.filter(grade => 
        grade.assignment.subject.code === subject
      )
    }

    return NextResponse.json({ 
      grades,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

