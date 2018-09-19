const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID, getSubject } = require('../helpers/getSubject')
const { getTimeID, getTime } = require('../helpers/getTime')

router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const { subject, timeFrom, timeTo, _date, present, pending } = req.body.data

  Promise
    .all([getTimeID(timeFrom, timeTo), getSubjectID(subject)])
    .then(responses => {
      const { timeid, sid } = responses

      const checkQuery = `select uid, _date from attendance where timeid = '${timeid}' and sid = '${sid}'`
      mysql.query(
        checkQuery,
        (err, result, fields) => {
          if(err)
            return console.log(err)

          if(result.length === 0) {
            const insertQuery = `insert into attendance values('${user.uid}', '${sid}',
                                  '${timeid}', '${_date}', '${present}', '${pending}')`
            mysql.query(
              insertQuery,
              (err, result) => {
                if(err)
                  return console.log(err)

                res.json(result)
              }
            )
          } else {
            const updateQuery = `update attendance set present = '${present}'`
          }
        }
      )
    })

})
