const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const MongoClient = require('mongoose')

const port = process.env.PORT || 5000

// body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// user-defined routes
const userRoutes = require('./routes/user.js')
// const profileRoutes = require('./routes/profile.js')
// const attendanceRoutes = require('./routes/attendance.js')

// connection to local mongoDB
MongoClient
  .connect(require('./config/keys').mongoURI, { useNewUrlParser: true })
  .then(() => console.log('connected to MONGO.'))
  .catch(err => console.log(err))

// routes
app.use('/user', userRoutes)
// app.use('/profile', profileRoutes)
// app.use('/attendance', attendanceRoutes)

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
