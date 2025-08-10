import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    if (!['admin', 'hod'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    await dbConnect()
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department') || (session.user.role === 'hod' ? session.user.department : null)
    const search = searchParams.get('search')

    const query = { role: 'faculty', isActive: true }
    if (department) query.department = department
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'academicInfo.name': { $regex: search, $options: 'i' } }
      ]
    }

    const faculty = await User.find(query).select('-password').sort({ 'academicInfo.name': 1 })
    return NextResponse.json({ faculty })
  } catch (error) {
    console.error('Faculty GET error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


