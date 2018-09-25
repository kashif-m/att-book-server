const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID } = require('../helpers/helpers')
const { getTimeID } = require('../helpers/helpers')

// validators
const { validateAttendanceSet, validateDay } = require('../validation/validators')

router.post('/set', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { data, errors, isValid } = validateAttendanceSet(req.body.data)
  if(!isValid)
    return res.status(400).json(errors)

  const { user } = req
  const { subject, timeFrom, timeTo, _date, present, pending } = data

  Promise
    .all([getTimeID(timeFrom, timeTo), getSubjectID(subject)])
    .then(responses => {
      const timeid = responses[0]
      const sid = responses[1]

      const checkQuery = `select uid, _date from attendance
        where uid = '${user.uid}' AND
        sid = '${sid}' AND
        timeid = '${timeid}' AND
        _date = '${_date}'`

      mysql
        .query(checkQuery)
        .then(result => {
          var query
          if(result.length === 0) {
            query = `insert into attendance
              values('${user.uid}', '${sid}', '${timeid}', '${_date}', '${present}', '${pending}')`
          } else {
            query = `UPDATE attendance
            SET present = '${present}',
                pending = '${pending}'
            WHERE uid = '${user.uid}' AND
            sid = '${sid}' AND
            _date = '${_date}' AND
            timeid = '${timeid}'`
          }
          return mysql.query(query)
        })
        .then(result => res.json(result))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.get('/:day/get', passport.authenticate('jwt', { session: false }), (req, res) => {

  const day = req.params.day
  const { errors, isValid } = validateDay(day)
  if(!isValid)
    return res.status(400).json(errors)

  const { user } = req
  const fetchQuery = `select dayname(a._date) as day, sname as subject, timeFrom, timeTo, present, pending
  from attendance a, users u, time_data td, subjects s
  where u.uid = '${user.uid}' AND
  u.uid = a.uid AND
  a.sid = s.sid AND
  a.timeid = td.timeid AND
  dayname(a._date) = '${day}'`
  mysql
    .query(fetchQuery)
    .then(result => {
      if(result.length === 0) {
        errors.msg = 'No attendance found.'
        return res.status(404).json(errors)
      }

      const attendance = {}
      result.map(data => {

        const { subject, timeFrom, timeTo, present, pending } = data
        attendance[data.day] = {
          subject,
          timeFrom,
          timeTo,
          present,
          pending
        }
      })
      res.json(attendance)
    })
})

module.exports = router
