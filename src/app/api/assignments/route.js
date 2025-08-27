// import { NextResponse } from 'next/server'
// import dbConnect from '@/lib/mongodb'
// import Assignment from '@/models/Assignment'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../auth/[...nextauth]/route'

// export async function GET(request) {
//   try {
//     await dbConnect()
    
<<<<<<< HEAD
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
=======
//     const session = await getServerSession(authOptions)
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }
>>>>>>> main

//     const { searchParams } = new URL(request.url)
//     const subject = searchParams.get('subject')
//     const role = session.user.role

//     let query = {}
    
//     // Filter by subject if provided
//     if (subject) {
//       query.subject = subject
//     }

//     // Role-based filtering
//     if (role === 'faculty') {
//       query.faculty = session.user.id
//     } else if (role === 'student') {
//       // For students, show assignments from their subjects
//       // This would need to be enhanced based on student enrollment
//     }

//     const assignments = await Assignment.find(query)
//       .populate('subject', 'code name')
//       .populate('faculty', 'academicInfo.name')
//       .sort({ createdAt: -1 })

<<<<<<< HEAD
  return NextResponse.json({ ok: true, data: assignments })

  } catch (error) {
    console.error('Error fetching assignments:', error)
  return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
=======
//     return NextResponse.json({ 
//       assignments,
//       success: true 
//     })

//   } catch (error) {
//     console.error('Error fetching assignments:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' }, 
//       { status: 500 }
//     )
//   }
// }
>>>>>>> main

// export async function POST(request) {
//   try {
//     await dbConnect()
    
<<<<<<< HEAD
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'faculty') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
=======
//     const session = await getServerSession(authOptions)
//     if (!session || session.user.role !== 'faculty') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }
>>>>>>> main

//     const body = await request.json()
//     const { title, description, subject, dueDate, maxMarks } = body

<<<<<<< HEAD
    if (!title || !description || !subject || !dueDate || !maxMarks) {
      return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Missing required fields' } }, { status: 400 })
    }
=======
//     if (!title || !description || !subject || !dueDate || !maxMarks) {
//       return NextResponse.json(
//         { error: 'Missing required fields' }, 
//         { status: 400 }
//       )
//     }
>>>>>>> main

//     const assignment = new Assignment({
//       title,
//       description,
//       subject,
//       faculty: session.user.id,
//       dueDate: new Date(dueDate),
//       maxMarks: parseInt(maxMarks)
//     })

//     await assignment.save()

<<<<<<< HEAD
  return NextResponse.json({ ok: true, data: assignment })

  } catch (error) {
    console.error('Error creating assignment:', error)
  return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
} 
=======
//     return NextResponse.json({ 
//       assignment,
//       success: true,
//       message: 'Assignment created successfully'
//     })

//   } catch (error) {
//     console.error('Error creating assignment:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' }, 
//       { status: 500 }
//     )
//   }
// } 
>>>>>>> main
