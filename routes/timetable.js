const express = require('express')
const passport = require('passport')
const uniqid = require('uniqid')

const mysql = require('../config/mysql')
const router = express.Router()
const helpers = require('../helpers/helpers')

router.post('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {

  const error = {}
  const { user, body } = req
  const data = JSON.parse(body.data)
  const totalDays = Object.keys(data).length
  var dayCount = 0, classCount = 0, sid, timeid

  const dataid = await helpers.getDataID(user.uid)
  console.log(dataid)

  let i = 0
  let j = 0
  // map each day
  Object
  .keys(data)
  .map(day => {

    setTimeout(() => {
      const classes = data[day]
      const totalClasses = Object.keys(classes).length
      // map each class in a day
      Object
        .keys(classes)
        .map(classNo => {

          setTimeout(() => {
          const { subject, timeFrom, timeTo } = classes[classNo]

          // fetch time and subject IDs
          Promise
            .all([helpers.getTimeID(timeFrom, timeTo), helpers.getSubjectID(subject)])
            .then(responses => {
              timeid = responses[0]
              sid = responses[1]
              const checkQuery = `select * from timetable_data
                where dataid = '${dataid}' AND
                class_no = '${classNo}' AND
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
              if(!result || (classCount === totalClasses && dayCount === totalDays)) {
                return res.json('done')
              }
            })
            .catch(err => console.log(err))
          }, 10*j++)
        })
      }, 10*i++)
    })
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
