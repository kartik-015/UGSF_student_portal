import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = { role: 'counselor', isActive: true, isRegistered: true }

    // Additional filters
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'academicInfo.name': { $regex: search, $options: 'i' } }
      ]
    }

    const counselors = await User.find(query)
      .select('-password')
      .sort({ 'academicInfo.name': 1 })

    return NextResponse.json({ counselors })

  } catch (error) {
    console.error('Counselors GET error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    await dbConnect()

    const body = await request.json()
    const { email, password, name, department, phoneNumber, address } = body

    // Validate required fields
    if (!email || !password || !name || !department) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const counselor = new User({
      email: email.toLowerCase(),
      password,
      role: 'counselor',
      department,
      admissionYear: new Date().getFullYear(), // Default to current year
      academicInfo: {
        name,
        phoneNumber,
        address,
      },
      isRegistered: false
    })

    await counselor.save()

    return NextResponse.json({ 
      message: 'Counselor created successfully',
      counselor: {
        id: counselor._id,
        email: counselor.email,
        role: counselor.role,
        department: counselor.department,
        academicInfo: counselor.academicInfo,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Counselors POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
