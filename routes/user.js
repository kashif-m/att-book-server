const bcrypt = require('bcryptjs')
const express = require('express')
const uniqid = require('uniqid')
const router = express.Router()
const mysql = require('../database/mysqlconfig')

router.post('/add', (req, res) => {

  const errors = {}
  const { email, password } = req.body

  // check if user exists
  const checkUserQuery = `select * from users where email = '${email}'`
  mysql.query(
    checkUserQuery,
    function(err, result, fields) {

      if(err)
        return console.log(err)

      if(result.length === 0) {
        const addUserQuery = `insert into users values('${uniqid.process()}', '${email}', 'unset')`
        mysql.query(
          addUserQuery,
          function(err, result) {
            
            if(err)
              return console.log(err)
            // generate a hash for the given password
            bcrypt
              .genSalt(10)
              .then(salt => {
                bcrypt
                  .hash(password, salt)
                  .then(hash => {
                    // update the password in the column
                    const updatePasswordQuery = `update users set password='${hash}' where email='${email}'`
                    mysql.query(
                      updatePasswordQuery,
                      (err, result) => {
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

module.exports = router
