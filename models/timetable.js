const mongoose = require('mongoose')
const { Schema } = mongoose

const timetableProfile = new Schema({

  cid: {
    type: Schema.Types.ObjectId
  },
  subject: {
    type: String
  },
  date: {
    type: Date
  }
})

module.exports = Timetable = new mongoose.model('timetable', timetableProfile)
