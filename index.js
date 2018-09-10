const bodyParser = require('body-parser')
const express = require('express')
const passport = require('passport')

const app = express()
const mysql = require('./config/mysql')

const port = 5000

// connect to MySQL DB
mysql.connect(function(err) {
  if(err)
    return console.log('Error connecting to MySQL database ' + err.stack)
  
  console.log('Connected to MySQL.')
})

// passport authorization
app.use(passport.initialize())
require('./config/passport')(passport)

// body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// user-defined routes
const userRoutes = require('./routes/user.js')
// const attendanceRoutes = require('./routes/attendance.js')

// routes
app.use('/user', userRoutes)
// app.use('/profile', profileRoutes)
// app.use('/attendance', attendanceRoutes)

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
