const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID } = require('../helpers/helpers')
const { getTimeID } = require('../helpers/helpers')

// validators
const { validateAttendanceSet, validateDate } = require('../validation/validators')

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

      const checkQuery = `SELECT uid, _date FROM attendance
        WHERE uid = '${user.uid}' AND
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

router.get('/:date/get', passport.authenticate('jwt', { session: false }), (req, res) => {

  const _date = req.params.date
  const { errors, isValid } = validateDate(_date)
  if(!isValid)
    return res.status(400).json(errors)

  const { user } = req
  const fetchQuery = `SELECT dayname(${_date}) as _date, sname as subject, timeFrom, timeTo, present, pending
  FROM attendance a, user u, time_data td, subject s
  WHERE u.uid = '${user.uid}' AND
  a.uid = u.uid AND
  a.timeid = td.timeid AND
  a.sid = s.sid AND
  _date = '${_date}'
  ORDER BY timeFrom`
  mysql
    .query(fetchQuery)
    .then(result => {
      if(result.length === 0) {
        errors.msg = 'No attendance found.'
        return res.status(404).json(errors)
      }

      const attendance = {}
      var count = 0
      result.map(data => {

        const { subject, timeFrom, timeTo, present, pending } = data
        attendance[count++] = {
          subject,
          timeFrom,
          timeTo,
          present,
          pending
        }
      })
      res.json(attendance)
    })
    .catch(err => console.log(err))
})

module.exports = router
