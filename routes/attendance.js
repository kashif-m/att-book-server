const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID, getSubject } = require('../helpers/helpers')
const { getTimeID, getTime } = require('../helpers/helpers')

router.post('/set', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const data = JSON.parse(req.body.data)
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

module.exports = router
