import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: ['CSE', 'CE', 'IT', 'ME', 'EC', 'CH', 'DIT'],
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: String,
  syllabus: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

subjectSchema.index({ code: 1, department: 1 }, { unique: true })

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema)

export default Subject