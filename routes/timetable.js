const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()
const getSubjectID = require('../helpers/getSubject')
const getTimeID = require('../helpers/getTime')

router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {

  const user = req.user
  const data = JSON.parse(req.body.data)
  const day = data.day
  const classes = data.classes
  const length = Object.keys(classes).length
  console.log(length)

  Object.keys(classes).map(key => {

    const data = classes[key]
    var count = 0
    var timeid

    getTimeID(data.timeFrom, data.timeTo)
      .then(timeID => {

        timeid = timeID
        return getSubjectID(data.subject)
      })
      .then(sid => {

        const checkQuery = `select uid from timetable where uid = '${user.uid}' and day = '${day}' and sid = '${sid}' and timeid = '${timeid}'`
        mysql.query(
          checkQuery,
          (err, result, fields) => {
            if(err)
              return console.log(err)

            if(result.length !== 0)
              return res.json({ success: true })
            
            const insertQuery = `insert into timetable values('${user.uid}', '${day}', '${sid}', '${timeid}')`
            mysql.query(
              insertQuery,
              (err, result, fields) => {
                if(err)
                  return console.log(err)

                if(count === length-1)
                  res.json(result)

                count++
              }
            )
          }
        )

      })
      .catch(err => console.log(err))
  })
})

module.exports = router
