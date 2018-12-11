const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const passport = require('passport')
const path = require('path')

const app = express()
const port = process.env.PORT || 5000

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
app.use('/user', userRoutes)
app.use('/timetable', timetableRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/stats', statRoutes)
app.use('/password', passwordResetRoutes)

// serve static assests
if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

app.listen(port, () => console.log(`Listening on port ${port}.`))
