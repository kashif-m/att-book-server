const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const helpers = require('../helpers/helpers')

// validators
const { validateTimetableAdd } = require('../validation/validators')

router.post('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user, body } = req
  const { timetable } = body
  const { errors, isValid } = validateTimetableAdd(timetable)
  if(!isValid)
    return res.status(400).json(errors)

  let affectedRows = 0
  const daysArr = Object.keys(timetable)
  const totalDays = daysArr.length

  for(var i = 0; i < totalDays; i++) {

    const day = daysArr[i]

    const classesArr = Object.keys(timetable[day])
    const totalClasses = classesArr.length

    for(var j = 0; j < totalClasses; j++) {

      const classNo = classesArr[j]
      const sid = await helpers.getSubjectID(timetable[day][classNo])
      const insertQuery = `insert into timetable
        values('${user.uid}', '${day}', ${j+1}, '${sid}')`

      mysql
        .query(insertQuery)
        .then(res => affectedRows += res ? res.affectedRows : 0)
        .catch(err => console.log(err))
    } // end j loop
  } // end i loop

  res.json(affectedRows)
})

router.post('/update', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user, body } = req
  const { timetable } = body
  var affectedRows = 0
  const daysArr = Object.keys(timetable)
  const totalDays = daysArr.length

  for(var i = 0; i < totalDays; i++) {

    const day = daysArr[i]
    const classesArr = Object.keys(timetable[day])
    const totalClasses = classesArr.length

    for(var j = 0; j < totalClasses; j++) {

      const classNo = classesArr[j]
      const sid = await helpers.getSubjectID(timetable[day][classNo])
      const replaceQuery = `replace into timetable
        values('${user.uid}', '${day}', ${classNo}, '${sid}')`

      mysql
        .query(replaceQuery)
        .then(res => affectedRows += res ? res.affectedRows : 0)
        .catch(err => console.log(err))
    } // end j loop

    const removeQuery = `delete from timetable
      where uid = '${uid}' AND
      day = '${day}' AND
      classNo > ${totalClasses}`
    mysql
      .query(removeQuery)
      .then(res => affectedRows += res ? res.affectedRows : 0)
      .catch(err => console.log(err))
  } // end i loop

  res.json(affectedRows)
})

router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user } = req
  const removeQuery = `delete from timetable
    where uid = '${user.uid}'`

  mysql
    .query(removeQuery)
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

router.get('/get/:day', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const { day } = req.params

  const fetchQuery = `select classNo, sname
    from timetable tt, subject s
    where uid = '${user.uid}' AND
    s.sid = tt.sid AND
    day = '${day}'`

  mysql
    .query(fetchQuery)
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

router.get('/fetch', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  const errors = {}

  const { user } = req
  const fetchQuery = `select day, classNo, sname
    from timetable tt, subject s
    where uid = '${user.uid}' AND
    tt.sid = s.sid`
  mysql
    .query(fetchQuery)
    .then(result => {

      if(result.length === 0)
        return res.json({})

      const timetable = {}
      const length = result.length

      result.map((data, index) => {

        const { day, sname, classNo } = data
        timetable[day] = timetable[day] || {}
        timetable[day][classNo] = sname

        if(index === length-1)
          res.json(timetable)
      })
    })
    .catch(err => console.log(err))
})

module.exports = router
