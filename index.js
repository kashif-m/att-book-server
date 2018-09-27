const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const passport = require('passport')

const app = express()
const mysql = require('./config/mysql')
const port = 5000

// connect to MySQL DB
mysql.connection.connect(err => {
  if(err)
    return console.log('Error connecting to MySQL database ' + err)
  console.log('Connected to MySQL.')
})

// passport authorization
app.use(passport.initialize())
require('./config/passport')(passport)

// body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// enable CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// user-defined routes
const userRoutes = require('./routes/user')
const timetableRoutes = require('./routes/timetable')
const attendanceRoutes = require('./routes/attendance.js')

// routes
app.use('/user', userRoutes)
app.use('/timetable', timetableRoutes)
app.use('/attendance', attendanceRoutes)

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
