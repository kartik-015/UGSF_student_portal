import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import ProjectGroup from '@/models/ProjectGroup'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'hod', 'faculty'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const department = searchParams.get('department')
    const semester = searchParams.get('semester')


    let query = { role: 'student', isActive: true }

    // For HOD: allow filtering by any department if selected, otherwise default to their own
    if (session.user.role === 'hod') {
      if (searchParams.has('department')) {
        // If the filter is present (even if empty), do not restrict department
        if (department) {
          query.department = department
        }
        // else: no department filter, show all
      } else {
        // If filter is not present at all, default to HOD's department
        query.department = session.user.department
      }
    } else if (department) {
      query.department = department
    }

    // Additional filters
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'academicInfo.name': { $regex: search, $options: 'i' } },
        { 'academicInfo.rollNumber': { $regex: search, $options: 'i' } }
      ]
    }

    if (semester) {
      query['academicInfo.semester'] = parseInt(semester)
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ 'academicInfo.name': 1 })

    // For HOD/admin include project membership summary
    if (['hod', 'admin'].includes(session.user.role)) {
      const studentIds = students.map(s => s._id)
      const groups = await ProjectGroup.find({ 'members.student': { $in: studentIds } }).select('groupId members')
      const membership = {}
      groups.forEach(g => {
        g.members.forEach(m => {
          const key = String(m.student)
          if (!membership[key]) membership[key] = []
          membership[key].push(g.groupId)
        })
      })
      return NextResponse.json({ students, projectMemberships: membership })
    }

    return NextResponse.json({ students })

  } catch (error) {
    console.error('Students GET error:', error)
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
    const { email, password, name, department, admissionYear, semester, section, rollNumber, phoneNumber, address, counselor } = body

    // Validate required fields
    if (!email || !password || !name || !department || !admissionYear) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    // Validate counselor exists if provided
    let counselorId = counselor
    if (counselor) {
      const counselorUser = await User.findById(counselor)
      if (!counselorUser || counselorUser.role !== 'counselor') {
        return NextResponse.json({ message: 'Invalid counselor ID' }, { status: 400 })
      }
    }

    const student = new User({
      email: email.toLowerCase(),
      password,
      role: 'student',
      department,
      admissionYear: parseInt(admissionYear),
      academicInfo: {
        name,
        semester: semester ? parseInt(semester) : undefined,
        section,
        rollNumber,
        phoneNumber,
        address,
      },
      counselor: counselorId,
      isRegistered: false
    })

    await student.save()

    return NextResponse.json({ 
      message: 'Student created successfully',
      student: {
        id: student._id,
        email: student.email,
        role: student.role,
        department: student.department,
        academicInfo: student.academicInfo,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Students POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
