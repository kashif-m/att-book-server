const express = require('express')
const passport = require('passport')
const uniqid = require('uniqid')

const mysql = require('../config/mysql')
const router = express.Router()

router.post('/add',  passport.authenticate('jwt', { session: false }), (req, res) => {

  const subjects = req.body.subjects.split(',')
  for(let i = 0; i < subjects.length; i++) {

    // check if subject exists
    const checkSubjectQuery = `select sid from subjects where sname = '${subjects[i]}'`
    mysql.query(
      checkSubjectQuery,
      (err, result, fields) => {
        if(err)
          return console.log(err)

        if(result.length === 0) {
          const insertSubjectQuery = `insert into subjects values('${uniqid.process()}', '${subjects[i]}')`
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
