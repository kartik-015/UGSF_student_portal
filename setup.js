#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🎓 Student Portal Setup')
console.log('=======================\n')

const questions = [
  {
    name: 'mongodb_uri',
    question: 'Enter your MongoDB URI (default: mongodb://localhost:27017/student-portal): ',
    default: 'mongodb://localhost:27017/student-portal'
  },
  {
    name: 'nextauth_secret',
    question: 'Enter your NextAuth secret (default: your-super-secret-key-change-this-in-production): ',
    default: 'your-super-secret-key-change-this-in-production'
  },
  {
    name: 'cloudinary_cloud_name',
    question: 'Enter your Cloudinary cloud name (optional): ',
    default: ''
  },
  {
    name: 'cloudinary_api_key',
    question: 'Enter your Cloudinary API key (optional): ',
    default: ''
  },
  {
    name: 'cloudinary_api_secret',
    question: 'Enter your Cloudinary API secret (optional): ',
    default: ''
  }
]

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.question, (answer) => {
      resolve(answer || question.default)
    })
  })
}

async function setup() {
  try {
    console.log('Please provide the following configuration:\n')
    
    const answers = {}
    
    for (const q of questions) {
      answers[q.name] = await askQuestion(q)
    }
    
    // Create .env.local file
    const envContent = `# Database
MONGODB_URI=${answers.mongodb_uri}

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${answers.nextauth_secret}

# Socket Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=${answers.cloudinary_cloud_name}
CLOUDINARY_API_KEY=${answers.cloudinary_api_key}
CLOUDINARY_API_SECRET=${answers.cloudinary_api_secret}

# Server Configuration
PORT=3000
NODE_ENV=development
`

    fs.writeFileSync('.env.local', envContent)
    
    console.log('\n✅ Configuration saved to .env.local')
    console.log('\nNext steps:')
    console.log('1. Make sure MongoDB is running')
    console.log('2. Run: npm install')
    console.log('3. Run: npm run seed (to populate sample data)')
    console.log('4. Run: npm run dev')
    console.log('5. Open http://localhost:3000')
    console.log('\nDefault users will be created after running npm run seed')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  } finally {
    rl.close()
  }
}

setup()
