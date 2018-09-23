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
  mysql.query(
    checkQuery,
    (err, result, field) => {
      if(err)
        return console.log(err)
      
      if(result && result.length === 1)
        return res.json('Already exists')
      
      const insertQuery = `insert into timetable values('${user.uid}', '${dataid}')`
      mysql.query(
        insertQuery,
        (err, result) => {
          if(err)
            return console.log(err)
        }
      )
        
      const data = JSON.parse(req.body.data)
      const totalDays = Object.keys(data).length
      var dayCount = 0, affectedRows = 0    
      Object.keys(data).map(day => {

        const classes = data[day]
        const totalClasses = Object.keys(classes).length
        Object.keys(classes).map(classNo => {

          const data = classes[classNo]
          const { subject, timeFrom, timeTo } = data
          Promise
            .all([getTimeID(timeFrom, timeTo), getSubjectID(subject)])
            .then(responses => {
              const [ timeid, sid ] = responses

              const insertQuery = `insert into timetable_data values('${dataid}', '${classNo}', '${sid}', '${timeid}', '${day}')`
              mysql.query(
                insertQuery,
                (err, result) => {

                  if(err)
                    return console.log(err)
                    
                  affectedRows += result ? result.affectedRows : 0                    
                  if(parseInt(classNo) === totalClasses)
                    dayCount++    
                  if(dayCount === totalDays && parseInt(classNo) === totalClasses)
                    return res.json(affectedRows)
                }
              )
            })
            .catch(err => console.log(err))
        })
      })    
    }
  )  
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
