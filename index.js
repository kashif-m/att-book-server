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

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// enable CORS
const corsOptions = {
  origin: 'http://localhost:3002',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// user-defined routes
const userRoutes = require('./routes/user')
const timetableRoutes = require('./routes/timetable')
const attendanceRoutes = require('./routes/attendance')
const statRoutes = require('./routes/stats')
const passwordResetRoutes = require('./routes/password-reset')

// routes
app.get('/', (req, res) => res.send('welcome'))
app.use('/user', userRoutes)
app.use('/timetable', timetableRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/stats', statRoutes)
app.use('/password', passwordResetRoutes)

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
