const express = require('express')
const passport = require('passport')
const dateFns = require('date-fns')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID, getAttendanceID } = require('../helpers/helpers')

// validators
const { validateAttendanceSet, validateDate } = require('../validation/validators')

router.post('/set', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const { errors, isValid } = validateAttendanceSet(req.body)
  if(!isValid)
    return res.status(400).json(errors)
  
  const { user } = req
  const { classNo, status, subject, _date } = req.body
  const aid = await getAttendanceID(user.uid)
  const sid = await getSubjectID(subject)

  const present = status === 'present'
  const pending = status === 'pending'

  const replaceQuery = `replace into attendance
          values('${aid}', '${_date}', ${classNo}, '${sid}', ${present}, ${pending})`
  mysql
  .query(replaceQuery)
  .then(result => res.json(result))
  .catch(err => console.log(err))
})

router.get('/:date/get', passport.authenticate('jwt', { session: false }), (req, res) => {

  const _date = req.params.date
  const { errors, isValid } = validateDate(_date)
  if(!isValid)
    return res.status(400).json(errors)

  const { user } = req
  const fetchQuery = `SELECT dayname('${_date}') as day, classNo, sName, present, pending
    FROM attendance a, profile p, subjects s, user u
    WHERE u.uid = '${user.uid}' AND
    p.uid = u.uid AND
    a.aid = p.aid AND
    s.sid = a.sid AND
    _date = '${_date}'
    ORDER BY classNo`
  mysql
    .query(fetchQuery)
    .then(result => {
      if(result.length === 0) {
        return res.json({})
      }

      const attendance = mapAttendance(result)
      res.json(attendance)
    })
    .catch(err => console.log(err))
})

mapAttendance = (rawData) => {
  
  const attendance = {}  
  rawData.map(dailyAtt => {
        
    const { day, classNo, sName, present, pending } = dailyAtt
    if(!attendance[day])
      attendance[day] = {}

    attendance[day][classNo] = {
      subject: sName,
      status: present === 1 ? 'present' : pending === 1 ? 'pending' : 'absent'
    }
  })

  return attendance
}

router.get('/:date/getWeekly', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const _date = req.params.date
  const endDate = dateFns.format(dateFns.addWeeks(_date, 1), 'YYYY-MM-DD')

  const fetchWeeklyQuery = `SELECT dayname(_date) as day, classNo, sName, present, pending
    FROM attendance a, subjects s, profile p
    WHERE p.uid='${user.uid}' AND
      a.aid = p.aid AND
      s.sid = a.sid AND
      _date BETWEEN '${_date}' AND '${endDate}'`

  mysql
    .query(fetchWeeklyQuery)
    .then(result => {

      if(result.length === 0)
        return res.json({})
      const attendance = mapAttendance(result)
      res.json(attendance)
    })
})

module.exports = router
