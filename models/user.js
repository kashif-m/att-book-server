const mongoose = require('mongoose')
const { Schema } = mongoose

const userProfile = new Schema({
  
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  _dateCreated: {
    type: Date,
    default: Date.now()
  }
})

module.exports = User = mongoose.model('users', userProfile)
