import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all counselors (including approval info)
    const counselors = await User.find({ role: 'counselor' })
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({ 
      counselors,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching counselors:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
