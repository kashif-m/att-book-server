const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID, getSubject } = require('../helpers/getSubject')
const { getTimeID, getTime } = require('../helpers/getTime')

router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const data = JSON.parse(req.body.data)
  const { day, classes } = data
  const length = Object.keys(classes).length
  var count = 0

  Object.keys(classes).map(key => {

    const data = classes[key]
    const { subject, timeFrom, timeTo } = data
    Promise
      .all([getTimeID(timeFrom, timeTo), getSubjectID(subject)])
      .then(responses => {
        const [ timeid, sid ] = responses

        // check if the record exists
        const checkQuery = `select uid from timetable where uid = '${user.uid}' and day = '${day}' and sid = '${sid}' and timeid = '${timeid}'`
        mysql.query(
          checkQuery,
          (err, result, fields) => {
            if(err)
              return console.log(err)

            if(result.length !== 0 && count === length-1)
              return res.json({ success: true })
            // insert into timetable if it doesn't exist
            else if(result.length === 0) {
              const insertQuery = `insert into timetable values('${user.uid}', '${day}', '${sid}', '${timeid}')`
              mysql.query(
                insertQuery,
                (err, result) => {
                  if(err)
                    return console.log(err)
                  
                  if(count === length-1)
                    return res.json(result)
                }
              )
            }
            count++
          }
        )
      })
      .catch(err => console.log(err))
  })
})

router.post('/fetch', passport.authenticate('jwt', { session: false }), (req, res) => {

  const errors = {}

  const { user } = req
  const day = req.body.day

  const fetchQuery = `select sid, timeid from timetable where uid = '${user.uid}' and day = '${day}'`
  mysql.query(
    fetchQuery,
    (err, result, field) => {
      if(err)
        return console.log(err)

      if(result.length === 0) {
        errors.exists = false
        return res.status(404).json(errors)
      }

      const timetable = {}
      const length = result.length
      var count = 0
      
      result.map((key, index) => {
        Promise
          .all([getTime(key.timeid), getSubject(key.sid)])
          .then(responses => {
            const [ timeData, sName ] = responses
            timetable[index] = {}
            timetable[index].sName = sName
            timetable[index].timeData = timeData

            if(count++ === length - 1)
              res.json(timetable)
          })
          .catch(err => console.log(err))
      })
    }
  )
})

module.exports = router
