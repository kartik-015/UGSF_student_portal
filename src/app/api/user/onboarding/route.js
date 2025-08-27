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

    // Role-based validation
    const role = session.user.role
  const isStudent = role === 'student'
  const isStaff = ['faculty', 'hod'].includes(role)
    const missingCommon = !name || !phoneNumber || !address || !department
    if (missingCommon) {
      return NextResponse.json({ error: 'Name, phone number, address and department are required' }, { status: 400 })
    }
    if (isStudent) {
      if (!rollNumber || !admissionYear || !semester || !section) {
        return NextResponse.json({ error: 'Student academic fields are required' }, { status: 400 })
      }
    } else if (isStaff) {
      if (!specialization || !education) {
        return NextResponse.json({ error: 'Specialization and education are required for staff' }, { status: 400 })
      }
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
  admissionYear: isStudent ? admissionYear : undefined,
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

    const res = NextResponse.json({ 
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
    // Set onboarding completion cookie (value = user id) so middleware can allow immediate redirect before JWT refresh
    try {
      res.cookies.set('onboarded', updatedUser._id.toString(), { path: '/', maxAge: 60 * 60 * 24 * 30 })
    } catch {}
    return res

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}