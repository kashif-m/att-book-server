const express = require('express')
const passport = require('passport')
const uniqid = require('uniqid')

const mysql = require('../config/mysql')
const router = express.Router()

router.post('/add',  passport.authenticate('jwt', { session: false }), (req, res) => {

  const subjects = req.body.subjects.split(',')
  for(let i = 0; i < subjects.length; i++) {

    const sid = uniqid.process()
    // check if subject exists
    const checkSubjectQuery = `select sname from subjects where sid = '${sid}'`
    mysql.query(
      checkSubjectQuery,
      (err, result, fields) => {
        if(err)
          return console.log(err)

        if(result.length === 0) {
          const insertSubjectQuery = `insert into subjects values('${sid}', '${subjects[i]}')`
          mysql.query(
            insertSubjectQuery,
            (err, result) => {
              if(err)
                return console.log(err)

              if(i === subjects.length - 1)
                res.json(result)
            }
          )
        } else if(i === subjects.length - 1)
          res.json({ affectedRows: 0 })
      }
    )
  }
})

module.exports = router
