import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Force recompile during dev so schema changes (like required flags) apply
if (mongoose.models.User) {
  delete mongoose.models.User
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'faculty', 'hod'],
    default: 'student',
  },
  department: {
    type: String,
    enum: ['CSE', 'CE', 'IT', 'ME', 'EC', 'CH', 'DIT'],
    required: false,
  },
  university: {
    type: String,
    required: false,
  },
  institute: {
    type: String,
    required: false,
  },
  admissionYear: {
    type: Number,
    required: false,
  },
  academicInfo: {
    name: String,
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
    },
    rollNumber: String,
    phoneNumber: String,
    address: String,
  },
  // Onboarding fields
  interests: [{
    type: String,
    enum: [
      'Web Development', 'Mobile Development', 'Data Science', 'AI/ML',
      'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design',
      'Blockchain', 'IoT', 'Game Development', 'Software Engineering'
    ]
  }],
  experience: String,
  specialization: String,
  education: String,
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  // Approval workflow
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
})

// Extract department and admission year from email
userSchema.pre('save', function(next) {
  if (this.isModified('email') && this.role === 'student') {
    const emailMatch = this.email.match(/^(\d{2})([A-Z]{2,3})(\d{3})@charusat\.edu\.in$/)
    if (emailMatch) {
      this.admissionYear = this.admissionYear || (2000 + parseInt(emailMatch[1]))
      this.department = this.department || emailMatch[2]
    }
  }
  next()
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto')
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  return resetToken
}

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.academicInfo?.name || this.email.split('@')[0]
})

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  if (this.academicInfo?.name) {
    return this.academicInfo.name
  }
  if (this.role === 'student') {
    return this.rollNumber || this.email.split('@')[0]
  }
  return this.email.split('@')[0]
})

// Virtual for student info
userSchema.virtual('studentInfo').get(function() {
  if (this.role !== 'student') return null
  return {
    department: this.department,
    admissionYear: this.admissionYear,
    semester: this.academicInfo?.semester,
    section: this.academicInfo?.section,
    rollNumber: this.academicInfo?.rollNumber
  }
})

// Ensure virtuals are serialized
userSchema.set('toJSON', { virtuals: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User