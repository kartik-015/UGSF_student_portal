import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
  if (!['admin','hod'].includes(session.user.role)) return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  try {
    const list = (global.projectNotifications || []).filter(n => n.type==='guide-assigned')
  return NextResponse.json({ ok: true, data: list })
  } catch (e) {
  return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
