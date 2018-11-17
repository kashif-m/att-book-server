const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const helpers = require('../helpers/helpers')

// validators
const { validateTimetableAdd } = require('../validation/validators')

router.post('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user, body } = req
  const { errors, isValid } = validateTimetableAdd(body)
  if(!isValid)
    return res.status(400).json(errors)

  const { timetable } = body
  const ttid = await helpers.getTimetableID(user.uid)
  let affectedRows = 0
  
  const daysArr = Object.keys(timetable).map(day => day)
  const totalDays = daysArr.length

  for(var i = 0; i < totalDays; i++) {

    const day = daysArr[i]

    const classesArr = Object.keys(timetable[day])
    const totalClasses = classesArr.length

    for(var j = 0; j < totalClasses; j++) {

      const classNo = classesArr[j]
      const sid = await helpers.getSubjectID(timetable[day][classNo])
      const insertQuery = `insert into timetable
        values('${ttid}', '${day}', ${j+1}, '${sid}')`

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

  const ttid = await helpers.getTimetableID(user.uid)
  
  var affectedRows = 0
  const daysArr = Object.keys(timetable)
  const totalDays = daysArr.length

  for(var i = 0; i < totalDays; i++) {

    const day = daysArr[i]
    const totalClasses = Object.keys(timetable[day]).length
    const classesArr = Object.keys(timetable[day])
    const totalUpdateClasses = classesArr.length

    for(var j = 0; j < totalUpdateClasses; j++) {

      const classNo = classesArr[j]
      const sid = await helpers.getSubjectID(timetable[day][classNo])
      const replaceQuery = `replace into timetable
        values('${ttid}', '${day}', ${j+1}, '${sid}')`

      mysql
        .query(replaceQuery)
        .then(res => affectedRows += res ? res.affectedRows : 0)
        .catch(err => console.log(err))
    }

    if(totalClasses > totalUpdateClasses) {
      
      const removeQuery = `delete from timetable
        where ttid = '${ttid}' AND
        classNo > ${totalUpdateClasses}`
      mysql
        .query(removeQuery)
        .then(res => affectedRows += res ? res.affectedRows : 0)
        .catch(err => console.log(err))
    } // end j loop
  } // end i loop

  res.json(affectedRows)
})

router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user } = req
  const ttid = await helpers.getTimetableID(user.uid)

  const removeQuery = `delete from timetable
    where ttid = '${ttid}'`

  mysql
    .query(removeQuery)
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

router.get('/get/:day', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const { day } = req.params

  const fetchQuery = `select classNo, sname
    from timetable tt, profile p, subjects s
    where p.uid = '${user.uid}' AND
    p.ttid = tt.ttid AND
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
    from timetable tt, profile p, subjects s
    where p.uid = '${user.uid}' AND
    p.ttid = tt.ttid AND
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
