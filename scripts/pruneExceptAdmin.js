require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const User = require('../src/models/User').default || require('../src/models/User')

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set')
    process.exit(1)
  }
  await mongoose.connect(uri)

  try {
    // Find one admin to preserve (prefer explicitly marked admin or first found)
    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })
    if (!admin) {
      console.error('No admin user found. Aborting to avoid deleting everything.')
      process.exit(1)
    }

    const preservedId = admin._id.toString()
    console.log('Preserving admin id:', preservedId, admin.email)

    // Delete all users except preserved admin
    const userResult = await User.deleteMany({ _id: { $ne: preservedId } })
    console.log(`Deleted ${userResult.deletedCount} other users`)

    // Optional: prune other collections (add models if needed)
    // Example skeleton:
    // const Assignment = require('../src/models/Assignment').default || require('../src/models/Assignment')
    // await Assignment.deleteMany({})

    console.log('Prune complete.')
  } catch (e) {
    console.error('Error during prune:', e)
  } finally {
    await mongoose.disconnect()
  }
}

run()
