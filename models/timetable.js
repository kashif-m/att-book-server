const mongoose = require('mongoose')
const { Schema } = mongoose.Schema

const timetableProfile = new Schema([{
  day: {
    type: String
  },
  subject: {
    type: String
  },
  attendance: {
    present: {
      type: Boolean
    },
    pending: {
      type: Boolean
    }
  },
  date: {
    type: Date
  }
}])

module.exports = Timetable = new mongoose.model('timetable', timetableProfile)
