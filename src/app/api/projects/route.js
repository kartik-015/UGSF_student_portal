import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import ProjectGroup from '@/models/ProjectGroup'
import User from '@/models/User'

// Simple in-memory notifications (replace with persistent store later)
if (!global.projectNotifications) {
  global.projectNotifications = []
}

// Create a project group (student leader submits on behalf of the team)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })

    await dbConnect()

    const body = await request.json()

    let { title, description, domain, department, semester, members = [], memberEmails = [] } = body
    if (department) department = department.toUpperCase();

    if (!title || !department || !semester) {
  return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Missing required fields' } }, { status: 400 })
    }

    // Build members from ids or emails (optional at creation)
    const memberIds = [...new Set([
      ...members.map(m => String(m.student || m)),
      ...(await (async () => {
        if (!memberEmails || memberEmails.length === 0) return []
        const users = await User.find({ email: { $in: memberEmails.map(e => e.toLowerCase()) }, role: 'student' }).select('_id department')
        return users.map(u => String(u._id))
      })())
    ])]

  // Validate all member ids (allow cross-department)
  const memberUsers = await User.find({ _id: { $in: memberIds }, role: 'student' })
    if (memberUsers.length !== memberIds.length) {
  return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid members list' } }, { status: 400 })
    }
  // Removed department uniformity requirement (cross-department collaboration allowed)

    const leaderId = session.user.id
    const isLeaderIncluded = memberIds.some(id => String(id) === String(leaderId))
    const finalMembers = [ ...new Set([...memberIds, leaderId]) ].map(id => ({ student: id, role: String(id) === String(leaderId) ? 'leader' : 'member' }))

    const project = new ProjectGroup({
      title,
      description,
      domain,
      department,
      semester,
      members: finalMembers,
      leader: leaderId,
      createdBy: leaderId,
      status: 'submitted'
    })

    await project.save()

    try {
      if (global.io) {
        finalMembers.forEach(m => {
          global.io.to(`user-${m.student}`).emit('project:new', { projectId: project._id, groupId: project.groupId })
        })
      }
    } catch {}

  return NextResponse.json({ ok: true, data: project })
  } catch (error) {
    console.error('Project create error:', error)
  return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}

// List project groups for role
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const qDept = searchParams.get('department')
    const qYear = searchParams.get('year')
    const role = session.user.role
    let filter = {}

    if (role === 'student') {
      filter = { 'members.student': session.user.id }
    } else if (role === 'faculty') {
      // Faculty should only see groups explicitly assigned to them as internal guide
      filter = { internalGuide: session.user.id }
    } else if (role === 'hod') {
      // HOD sees all projects where the project.department matches their department
      const hodDept = session.user.department ? session.user.department.toUpperCase() : '';
      console.log('HOD department:', hodDept)
      filter = { department: hodDept }
      console.log('HOD project filter:', filter)
    } else if (role === 'admin') {
      // admin optional filters
      if (qDept) filter.department = qDept.toUpperCase()
    }

    // Year filter based on members' admissionYear (only for admin / hod)
    if (qYear && (role === 'admin' || role === 'hod')) {
      const yearUsers = await User.find({ admissionYear: Number(qYear) }).select('_id')
      const yearIds = yearUsers.map(u => u._id)
      filter.$and = [ { ...(filter.department ? { department: filter.department } : {}) }, { 'members.student': { $in: yearIds } } ]
      // Remove direct department key if moved into $and
      delete filter.department
    }

    const projects = await ProjectGroup.find(filter)
      .populate('leader', 'academicInfo.name email department admissionYear')
      .populate('members.student', 'academicInfo.name email department admissionYear')
      .populate('internalGuide', 'academicInfo.name email')
      .sort({ createdAt: -1 })

<<<<<<< HEAD
  return NextResponse.json({ ok: true, data: projects })
=======
    if (role === 'hod') {
      console.log('HOD Project Count:', projects.length)
    }

    return NextResponse.json({ projects })
>>>>>>> main
  } catch (error) {
    console.error('Project list error:', error)
  return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}

// HOD actions: approve/reject, assign guides
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })

    await dbConnect()
    const body = await request.json()
    const { projectId, approve, internalGuideId, externalGuide, addMember, removeMember } = body
    const project = await ProjectGroup.findById(projectId)
  if (!project) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })

    // Add member (student can add to own project; hod/admin can add; leader only)
    if (addMember) {
      if (session.user.role === 'student' && String(project.leader) !== String(session.user.id)) {
  return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only leader can add members' } }, { status: 403 })
      }
      if (!['admin','hod','student'].includes(session.user.role)) {
  return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
      }
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(addMember)
      const lookup = isObjectId ? { _id: addMember } : { email: addMember.toLowerCase() }
      const user = await User.findOne(lookup)
  if (!user || user.role !== 'student') return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Student not found' } }, { status: 400 })
  if (user.department !== project.department) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Department mismatch' } }, { status: 400 })
      const already = project.members.find(m => String(m.student) === String(user._id))
  if (already) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Already a member' } }, { status: 400 })
      project.members.push({ student: user._id, role: 'member' })
      await project.save()
      try { if (global.io) global.io.to(`user-${user._id}`).emit('project:added', { projectId: project._id, groupId: project.groupId }) } catch {}
  return NextResponse.json({ ok: true, data: project })
    }

    if (removeMember) {
      // Leader / admin / hod can remove
      if (!['admin','hod','student'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (session.user.role === 'student' && String(project.leader) !== String(session.user.id)) {
        return NextResponse.json({ error: 'Only leader can remove members' }, { status: 403 })
      }
      const memberDocLookup = /^[0-9a-fA-F]{24}$/.test(removeMember) ? { _id: removeMember } : { email: removeMember.toLowerCase() }
      const memberDoc = await User.findOne(memberDocLookup)
  if (!memberDoc) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Member not found' } }, { status: 400 })
  if (String(memberDoc._id) === String(project.leader)) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Cannot remove leader' } }, { status: 400 })
      const before = project.members.length
      project.members = project.members.filter(m => String(m.student) !== String(memberDoc._id))
  if (project.members.length === before) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Not a member' } }, { status: 400 })
      await project.save()
  return NextResponse.json({ ok: true, data: project })
    }

    if (session.user.role !== 'hod' && session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
    }

    if (typeof approve === 'boolean') {
      project.status = approve ? 'approved' : 'rejected'
    }
    if (internalGuideId) {
      const faculty = await User.findById(internalGuideId)
      if (!faculty || !['faculty', 'hod'].includes(faculty.role)) {
        return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid internal guide' } }, { status: 400 })
      }
      project.internalGuide = faculty._id
      try {
        global.projectNotifications.unshift({
          type: 'guide-assigned',
            projectId: project._id.toString(),
            groupId: project.groupId,
            title: 'Internal Guide Assigned',
            message: `Guide ${faculty.academicInfo?.name || faculty.email} assigned to group ${project.groupId}`,
            ts: Date.now()
        })
        global.projectNotifications = global.projectNotifications.slice(0, 200)
      } catch {}
    }
    if (externalGuide) {
      project.externalGuide = externalGuide
    }

    await project.save()

  return NextResponse.json({ ok: true, data: project })
  } catch (error) {
    console.error('Project update error:', error)
  return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}

