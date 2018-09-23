const express = require('express')
const passport = require('passport')
const uniqid = require('uniqid')

const mysql = require('../config/mysql')
const router = express.Router()
const { getSubjectID, getSubject } = require('../helpers/getSubject')
const { getTimeID, getTime } = require('../helpers/getTime')

router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const dataid = uniqid.process()
  
  const checkQuery = `select dataid from timetable where uid = '${user.uid}'`
  mysql
    .query(checkQuery)
    .then(result => {

      if(result && result.length === 1) {
        res.json('Already exists')
        return
      }
      // create user's timetable id
      const insertQuery = `insert into timetable values('${user.uid}', '${dataid}')`
      return mysql.query(insertQuery)
    })
    .then(result => {

      // result will be null if user already exists [previous then]
      if(!result)
        return
      // retrieve data from body document
      const data = JSON.parse(req.body.data)
      const totalDays = Object.keys(data).length
      var dayCount = 0, affectedRows = 0      
      // map through each day
      Object
        .keys(data)
        .map(day => {
          const classes = data[day]
          const totalClasses = Object.keys(classes).length

          // map through each class in a day
          Object
            .keys(classes)
            .map(classNo => {
              const data = classes[classNo]
              const { subject, timeFrom, timeTo } = data

              // get time identifier and subject identifier
              Promise
                .all([getTimeID(timeFrom, timeTo), getSubjectID(subject)])
                .then(responses => {

                  const [ timeid, sid ] = responses
                  // insert a single class into table
                  const insertQuery = `insert into timetable_data values('${dataid}', '${classNo}', '${sid}', '${timeid}', '${day}')`
                  return mysql.query(insertQuery)
                })
                .then(result => {
                  // update affected rows
                  affectedRows += result ? result.affectedRows : 0
                  if(parseInt(classNo) === totalClasses)
                    dayCount++
                  if(dayCount === totalDays && parseInt(classNo) === totalClasses)
                    return res.json(affectedRows)
                })
                .catch(err => console.log(err))
            })
        })
    })
    .catch(err => console.log(err))
})

router.post('/fetch', passport.authenticate('jwt', { session: false }), (req, res) => {

  const error = {}

  const { user } = req
  const day = req.body.day

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
        error.msg = `No timetable found for ${day}.`
        return res.status(404).json(error)
      }

      const timetable = {}
      const length = result.length

      result.map((key, index) => {
        // init
        timetable[index] = {}
        timetable[index].time = {}
        // populate
        timetable[index].sName = key.sname
        timetable[index].time.from = key.timeFrom
        timetable[index].time.to = key.timeTo
        
        if(key.class_no === length)
          res.json(timetable)
      })
    })
    .catch(err => console.log(err))
})

module.exports = router
