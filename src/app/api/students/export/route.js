import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import ProjectGroup from '@/models/ProjectGroup'
import ExcelJS from 'exceljs'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    if (!['admin','hod','faculty'].includes(session.user.role)) return NextResponse.json({ message: 'Access denied' }, { status: 403 })

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const department = searchParams.get('department')
    const semester = searchParams.get('semester')
    const semesterParity = searchParams.get('semesterParity')
    const university = searchParams.get('university')
    const institute = searchParams.get('institute')

    let query = { role: 'student', isActive: true }

    if (session.user.role === 'hod') {
      if (searchParams.has('department')) {
        if (department) query.department = department
      } else {
        query.department = session.user.department
      }
    } else if (session.user.role === 'faculty') {
      if (searchParams.has('department')) {
        if (department) query.department = department
      } else {
        query.department = session.user.department
      }
    } else if (department) {
      query.department = department
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'academicInfo.name': { $regex: search, $options: 'i' } },
        { 'academicInfo.rollNumber': { $regex: search, $options: 'i' } }
      ]
    }

    if (semester) query['academicInfo.semester'] = parseInt(semester)
    if (semesterParity) {
      if (semesterParity === 'odd') query['academicInfo.semester'] = { $in: [1,3,5,7] }
      else if (semesterParity === 'even') query['academicInfo.semester'] = { $in: [2,4,6,8] }
    }
    if (university) query.university = university
    if (institute) query.institute = institute

    const students = await User.find(query).select('-password').sort({ 'academicInfo.name': 1 })

    // Build workbook
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Students')
    ws.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Admission Year', key: 'admissionYear', width: 12 },
      { header: 'Roll Number', key: 'roll', width: 15 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Institute', key: 'institute', width: 20 },
      { header: 'University', key: 'university', width: 20 }
    ]

    students.forEach(s => {
      ws.addRow({
        name: s.academicInfo?.name || '',
        email: s.email,
        department: s.department || '',
        semester: s.academicInfo?.semester || '',
        admissionYear: s.admissionYear || '',
        roll: s.academicInfo?.rollNumber || '',
        phone: s.academicInfo?.phoneNumber || '',
        institute: s.institute || '',
        university: s.university || ''
      })
    })

    const buffer = await wb.xlsx.writeBuffer()

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="students_export.xlsx"`
      }
    })
  } catch (error) {
    console.error('Students export error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
