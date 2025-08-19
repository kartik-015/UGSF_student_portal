import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  files: [{
    filename: String,
    url: String,
    size: Number,
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    marks: {
      type: Number,
      min: 0,
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: Date,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted',
  },
}, {
  timestamps: true,
})
  submissionSchema.index({ assignment: 1, student: 1 }, { unique: true })

// Check if submission is late
submissionSchema.pre('save', function(next) {
  if (this.isNew && this.assignment) {
    // This will be populated when querying
    if (this.submittedAt > this.assignment.dueDate) {
      this.status = 'late'
    }
  }
  next()
})

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema)

export default Submission 