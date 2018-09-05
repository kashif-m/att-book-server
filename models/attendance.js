const mongoose = require('mongoose')
const { Schema } = mongoose.Schema

const attendance = new Schema({
  subject: {
    type: Object
  },
})
