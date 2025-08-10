const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

// Import models - using dynamic import for ES6 modules
let User, Subject, Assignment

async function importModels() {
  const UserModule = await import('../src/models/User.js')
  const SubjectModule = await import('../src/models/Subject.js')
  const AssignmentModule = await import('../src/models/Assignment.js')
  
  User = UserModule.default
  Subject = SubjectModule.default
  Assignment = AssignmentModule.default
}

async function addTestData() {
  try {
    // Import models first
    await importModels()
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal')
    console.log('Connected to MongoDB')

    // Create test counselors
    const counselors = [
      {
        email: 'counselor1@charusat.edu.in',
        password: 'counselor123',
        role: 'counselor',
        department: 'CSE',
        isRegistered: false,
        academicInfo: {
          name: 'Dr. Sarah Johnson',
          phoneNumber: '9876543210',
          address: 'Faculty Block A, Charusat University'
        }
      },
      {
        email: 'counselor2@charusat.edu.in',
        password: 'counselor123',
        role: 'counselor',
        department: 'IT',
        isRegistered: false,
        academicInfo: {
          name: 'Prof. Michael Chen',
          phoneNumber: '9876543211',
          address: 'Faculty Block B, Charusat University'
        }
      }
    ]

    for (const counselorData of counselors) {
      const existingCounselor = await User.findOne({ email: counselorData.email })
      if (!existingCounselor) {
        const counselor = new User(counselorData)
        await counselor.save()
        console.log(`✅ Created counselor: ${counselorData.email}`)
      } else {
        console.log(`⚠️  Counselor already exists: ${counselorData.email}`)
      }
    }

    // Get counselor IDs for assigning to students
    const counselor1 = await User.findOne({ email: 'counselor1@charusat.edu.in' })
    const counselor2 = await User.findOne({ email: 'counselor2@charusat.edu.in' })

    // Create test students
    const students = [
      {
        email: '23DIT001@charusat.edu.in',
        password: 'student123',
        role: 'student',
        department: 'DIT',
        admissionYear: 2023,
        isRegistered: false,
        academicInfo: {
          name: 'Rahul Sharma',
          semester: 3,
          section: 'A',
          rollNumber: '23DIT001',
          phoneNumber: '9876543220',
          address: 'Student Hostel A, Room 101'
        },
        counselor: counselor1?._id
      },
      {
        email: '23DIT002@charusat.edu.in',
        password: 'student123',
        role: 'student',
        department: 'DIT',
        admissionYear: 2023,
        isRegistered: false,
        academicInfo: {
          name: 'Priya Patel',
          semester: 3,
          section: 'A',
          rollNumber: '23DIT002',
          phoneNumber: '9876543221',
          address: 'Student Hostel B, Room 102'
        },
        counselor: counselor1?._id
      },
      {
        email: '23CSE001@charusat.edu.in',
        password: 'student123',
        role: 'student',
        department: 'CSE',
        admissionYear: 2023,
        isRegistered: false,
        academicInfo: {
          name: 'Amit Kumar',
          semester: 5,
          section: 'B',
          rollNumber: '23CSE001',
          phoneNumber: '9876543222',
          address: 'Student Hostel C, Room 103'
        },
        counselor: counselor1?._id
      },
      {
        email: '23IT001@charusat.edu.in',
        password: 'student123',
        role: 'student',
        department: 'IT',
        admissionYear: 2023,
        isRegistered: false,
        academicInfo: {
          name: 'Neha Singh',
          semester: 3,
          section: 'C',
          rollNumber: '23IT001',
          phoneNumber: '9876543223',
          address: 'Student Hostel D, Room 104'
        },
        counselor: counselor2?._id
      },
      {
        email: '23IT002@charusat.edu.in',
        password: 'student123',
        role: 'student',
        department: 'IT',
        admissionYear: 2023,
        isRegistered: false,
        academicInfo: {
          name: 'Vikram Malhotra',
          semester: 5,
          section: 'D',
          rollNumber: '23IT002',
          phoneNumber: '9876543224',
          address: 'Student Hostel E, Room 105'
        },
        counselor: counselor2?._id
      }
    ]

    for (const studentData of students) {
      const existingStudent = await User.findOne({ email: studentData.email })
      if (!existingStudent) {
        const student = new User(studentData)
        await student.save()
        console.log(`✅ Created student: ${studentData.email}`)
      } else {
        console.log(`⚠️  Student already exists: ${studentData.email}`)
      }
    }

    console.log('\n🎉 Test data added successfully!')
    console.log('\n📋 Test Users:')
    console.log('Admin: admin@charusat.edu.in / admin123')
    console.log('Counselor 1: counselor1@charusat.edu.in / counselor123')
    console.log('Counselor 2: counselor2@charusat.edu.in / counselor123')
    console.log('Students: 23DIT001@charusat.edu.in to 23IT002@charusat.edu.in / student123')

  } catch (error) {
    console.error('❌ Error adding test data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

addTestData()
