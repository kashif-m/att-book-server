const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const helpers = require('../helpers/helpers')

// validators
const { validateTimetableAdd, validateTag } = require('../validation/validators')

router.post('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user, body } = req
  const { errors, isValid } = validateTimetableAdd(body)
  if(!isValid)
    return res.status(400).json(errors)

  const { timetable, tag } = body
  const totalDays = Object.keys(timetable).length
  const ttid = await helpers.getTimetableID(user.uid)

  var dayCount = 0, classCount = 0
  let i = 0, j = 0, affectedRows = 0
  // map each day
  Object.keys(timetable).map(async (day) => {

      const classes = timetable[day]
      const totalClasses = Object.keys(classes).length

      // map each class in a day
      await Object.keys(classes).map(classNo => {

          const { subject } = classes[classNo]
          // fetch time and subject IDs
          helpers.getSubjectID(subject)
            .then(sid => {
              const insertQuery = `insert into timetable
                values('${ttid}', '${day}', ${classNo}, '${sid}', '${tag}')`
              return mysql.query(insertQuery)
            })
            .then(result => {
              if(++classCount === totalClasses)
                if(++dayCount !== totalDays)
                  classCount = 0

              if(result)
                affectedRows += result.affectedRows
              if(classCount === totalClasses && dayCount === totalDays) {
                res.json(result || affectedRows)
                return
              }
            })
            .catch(err => console.log(err))
        })
    })
})

router.get('/get-all', passport.authenticate('jwt', { session: false }), (req, res) => {

  const {user} = req
  const fetchQuery = `select distinct tag from timetable tt, profile p
    where p.uid = '${user.uid}' AND
      tt.ttid = p.ttid`
  mysql
    .query(fetchQuery)
    .then(async (result) => {
      const arr = Object.keys(result).map(key => result[key].tag)
      res.json(arr)
    })
    .catch(err => console.log(err))
})

router.post('/fetch', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { tag } = req.body
  const { errors, isValid } = validateTag(tag)
  if(!isValid)
    return res.status(400).json(errors)

  const { user } = req
  const fetchQuery = `select day, classNo, sname
    from timetable tt, profile p, subjects s
    where p.uid = '${user.uid}' AND
    p.ttid = tt.ttid AND
    tt.sid = s.sid AND
    tag = '${tag}'`
  mysql
    .query(fetchQuery)
    .then(result => {

      if(result.length === 0) {
        errors.msg = `No timetable found for ${day}. (Tag: ${tag})`
        return res.status(404).json(errors)
      }

      const timetable = {}
      const length = result.length

      result.map((data, index) => {

        const { day, sname, classNo } = data
        timetable[day] = timetable[day] || {}
        timetable[day][classNo] = { subject: sname }

        if(index === length-1) {
          timetable.tag = tag
          res.json(timetable)
        }
      })
    })
    .catch(err => console.log(err))
})

module.exports = router
