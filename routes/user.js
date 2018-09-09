const bcrypt = require('bcryptjs')
const express = require('express')
const uniqid = require('uniqid')
const router = express.Router()
const mysql = require('../database/mysqlconfig')

router.post('/add', (req, res) => {

  const errors = {}

  const checkUserQuery = `select * from users where email='${req.body.email}';`
  mysql.query(
    checkUserQuery,
    function(err, result, fields) {
      if(err)
        return console.log(err)

      if(result.length === 0) {

        const addUserQuery = `insert into users values('${uniqid.process()}', '${req.body.email}', '');`
        mysql.query(
          addUserQuery,
          function(err, result, fields) {
            if(err)
              return console.log(err)

            bcrypt
              .genSalt(10)
              .then(salt => {
                bcrypt
                  .hash(req.body.password, salt)
                  .then(hash => {
                    const updatePassword = `update users set password='${hash}' where email='${req.body.email}';`
                    mysql.query(
                      updatePassword,
                      (err, result, fields) => {
                        if(err)
                          return console.log(err)
        
                        res.json(result)
                      }
                    )
                  })
                  .catch(err => console.log(err))
              })
              .catch(err => console.log(err))
          }
        )
      } else {

        errors.userExist = true
        return res.status(400).json(errors)
      }
    })
})

router.post('/checkUsername', (req, res) => {

  const errors = {}
  User
    .findOne({ username: req.body.username })
    .then(user => {

      console.log(user)
      if(user) {
        errors.available = false
        return res.status(400).json(errors)
      }

      res.json({ success: true })
    })
})

module.exports = router
