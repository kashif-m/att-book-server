const mongoose = require('mongoose')
const { Schema } = mongoose

const calendar = new Schema({

  uid: {
    type: Schema.Types.ObjectId
  },
  day: {
    type: String
  },
  date: {
    type: Date
  }
})

module.exports = Calendar = new mongoose.model('calendar', calendar)
