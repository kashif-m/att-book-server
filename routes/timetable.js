const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const helpers = require('../helpers/helpers')

// validators
const { validateTimetableAdd, validateDay } = require('../validation/validators')

router.post('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { user, body } = req
  const { data, errors, isValid } = validateTimetableAdd(body.data)
  if(!isValid)
    return res.status(400).json(errors)

  const totalDays = Object.keys(data).length
  var dayCount = 0, classCount = 0
  const dataid = await helpers.getDataID(user.uid)

  let i = 0
  let j = 0
  // map each day
  Object.keys(data).map(day => {

    setTimeout(() => {
      const classes = data[day]
      const totalClasses = Object.keys(classes).length
      // map each class in a day
      var sid, timeid
      Object.keys(classes).map(classNo => {

          setTimeout(() => {
          const { subject, timeFrom, timeTo } = classes[classNo]
          // fetch time and subject IDs
          Promise
            .all([helpers.getTimeID(timeFrom, timeTo), helpers.getSubjectID(subject)])
            .then(responses => {
              timeid = responses[0]
              sid = responses[1]
              console.log(timeid, sid)
              const checkQuery = `select * from timetable_data
                where dataid = '${dataid}' AND
                class_no = ${classNo} AND
                sid = '${sid}' AND
                timeid = '${timeid}' AND
                day = '${day}'`
              return mysql.query(checkQuery)
            })
            .then(result => {
              if(++classCount === totalClasses)
                if(++dayCount !== totalDays)
                  classCount = 0

              if(result.length === 0) {
                const insertQuery = `insert into timetable_data
                  values('${dataid}', '${classNo}', '${sid}', '${timeid}', '${day}')`
                return mysql.query(insertQuery)
              }
              if(classCount === totalClasses && dayCount === totalDays)
                return
            })
            .then(result => {
              if(classCount === totalClasses && dayCount === totalDays) {
                return res.json('done')
              }
            })
            .catch(err => console.log(err))
          }, 50*j++)
        })
      }, 50*i++)
    })
})

router.post('/fetch', passport.authenticate('jwt', { session: false }), (req, res) => {

  const day = req.body.day
  const { errors, isValid } = validateDay(day)
  if(!isValid)
    return res.status(400).json(errors)

  const { user } = req
  const fetchQuery = `select class_no, sname, timeFrom, timeTo
    from timetable t, subjects s, timetable_data td, time_data tid
    where t.uid = '${user.uid}' AND
    td.day = '${day}' AND
    s.sid = td.sid AND
    tid.timeid = td.timeid`
  mysql
    .query(fetchQuery)
    .then(result => {

      if(result.length === 0) {
        errors.msg = `No timetable found for ${day}.`
        return res.status(404).json(errors)
      }

      const timetable = {}
      const length = result.length

      result.map(data => {

        const { sname, timeFrom, timeTo, class_no } = data
        timetable[class_no] = {
          subject: sname,
          timeFrom,
          timeTo
        }
        
        if(data.class_no === length)
          res.json(timetable)
      })
    })
    .catch(err => console.log(err))
})

module.exports = router
