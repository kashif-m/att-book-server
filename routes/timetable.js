const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const getSubjectID = require('../helpers/getSubject')
const getTimeID = require('../helpers/getTime')

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
      const len = result.length
      var count = 0
      result.map((key, index) => {

        const fetchSubject = `select sname from subjects where sid = '${key.sid}'`
        mysql.query(
          fetchSubject,
          (err, result) => {
            if(err)
              return console.log(err)

            console.log(`res: ${result[0].sname}`)
            timetable[index] = {}
            timetable[index].subject = result[0].sname

            const fetchTime = `select timeFrom, timeTo from time_data where timeid = '${key.timeid}'`
            mysql.query(
              fetchTime,
              (err, result) => {
                if(err)
                  return console.log(err)

                timetable[index].timeFrom = result[0].timeFrom
                timetable[index].timeTo = result[0].timeTo
                
                if(count++ === len - 1) {
                  res.json(timetable)
                  console.log(timetable)
                }
              }
            )
          }
        )
      })
    }
  )
})

module.exports = router
