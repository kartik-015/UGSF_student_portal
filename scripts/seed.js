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

async function seed() {
  try {
    // Import models first
    await importModels()
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal')
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Subject.deleteMany({})
    await Assignment.deleteMany({})
    console.log('Cleared existing data')

    // Create ONLY admin user
    const admin = new User({
      email: 'admin@charusat.edu.in',
      password: 'admin123',
      role: 'admin',
      academicInfo: {
        name: 'System Administrator',
        phoneNumber: '1234567890',
        address: 'Charusat University'
      },
      isOnboarded: true
    })
    await admin.save()
    console.log('✅ Created admin user')

    // Create sample subjects (for faculty to assign later)
    const subjects = [
      {
        code: 'CS301',
        name: 'Data Structures',
        department: 'CSE',
        semester: 3,
        credits: 4,
        description: 'Advanced data structures and algorithms'
      },
      {
        code: 'CS302',
        name: 'Database Systems',
        department: 'CSE',
        semester: 3,
        credits: 3,
        description: 'Database design and management'
      },
      {
        code: 'IT301',
        name: 'Web Development',
        department: 'IT',
        semester: 3,
        credits: 4,
        description: 'Modern web development technologies'
      },
      {
        code: 'DIT301',
        name: 'Programming Fundamentals',
        department: 'DIT',
        semester: 3,
        credits: 3,
        description: 'Core programming concepts'
      }
    ]

    for (const subjectData of subjects) {
      const subject = new Subject(subjectData)
      await subject.save()
    }
    console.log('✅ Created sample subjects')

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@charusat.edu.in / admin123')
    console.log('\n📝 Registration Flow:')
    console.log('1. Students and counselors must register first')
    console.log('2. They will go through onboarding process')
    console.log('3. Admin can view all registrations')
    console.log('4. Admin can assign counselors to students')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seed() 