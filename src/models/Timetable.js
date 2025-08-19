const mongoose = require('mongoose')

const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subjectCode: { type: String, required: true },
  subjectName: { type: String },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room: { type: String },
  department: { type: String }
}, { timestamps: true })

const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema)
module.exports = Timetable
