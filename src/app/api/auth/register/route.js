import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { email, password, role } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      )
    }

    // Validate role
    if (!['student', 'faculty', 'hod'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Allowed roles: student, faculty, hod' }, 
        { status: 400 }
      )
    }

    let domainValid = false
    if (role === 'student') {
      domainValid = /@charusat\.edu\.in$/i.test(email)
    } else { // faculty or hod
      domainValid = /@charusat\.ac\.in$/i.test(email)
    }
    if (!domainValid) {
      return NextResponse.json(
        { error: `Invalid email domain for role ${role}` },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 409 }
      )
    }

    // Attempt extraction (optional) for legacy student pattern
    let department, admissionYear
    if (role === 'student') {
      const legacyPattern = /^(\d{2})([A-Z]{2,3})(\d{3})@charusat\.edu\.in$/i
      const m = email.match(legacyPattern)
      if (m) {
        admissionYear = 2000 + parseInt(m[1], 10)
        department = m[2].toUpperCase()
      }
    }

    // Create new user
    const requiresApproval = ['faculty', 'hod'].includes(role)
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      department: department || undefined,
      admissionYear: admissionYear || undefined,
      isOnboarded: false,
      isRegistered: true,
      isApproved: !requiresApproval,
      approvalStatus: requiresApproval ? 'pending' : 'approved',
      isActive: !requiresApproval
    })

    await user.save()

    return NextResponse.json({ 
      success: true,
      onboardingRequired: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ') },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
