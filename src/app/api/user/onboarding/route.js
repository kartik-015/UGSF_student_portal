import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phoneNumber,
      address,
      department,
      admissionYear,
      semester,
      section,
      rollNumber,
      interests,
      experience,
      domain,
      specialization,
      education
    } = body

    // Validate required fields
    const isStudent = session.user.role === 'student'
    const isStaff = ['faculty', 'hod', 'counselor'].includes(session.user.role)
    if (!name || !phoneNumber || !address || !department || (isStudent && !rollNumber)) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Update user with academic info
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        academicInfo: {
          name,
          phoneNumber,
          address,
          semester: isStudent ? semester : undefined,
          section: isStudent ? section : undefined,
          rollNumber: isStudent ? rollNumber : undefined
        },
        department,
        admissionYear: isStudent ? admissionYear : new Date().getFullYear(),
        domain: domain || undefined,
        specialization: specialization || undefined,
        education: education || undefined,
        interests: interests || [],
        experience: experience || '',
        isOnboarded: true
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        academicInfo: updatedUser.academicInfo,
        department: updatedUser.department,
        admissionYear: updatedUser.admissionYear,
        interests: updatedUser.interests,
        experience: updatedUser.experience
      }
    })

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}