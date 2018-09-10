const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const uniqid = require('uniqid')

const router = express.Router()
const mysql = require('../config/mysql')
const secretOrKey = require('../config/keys').secretOrKey

router.post('/add', (req, res) => {

  const errors = {}
  const { email, password } = req.body

  // check if user exists
  const checkUserQuery = `select uid from users where email = '${email}'`
  mysql.query(
    checkUserQuery,
    (err, result, fields) => {

      if(err)
        return console.log(err)

      if(result.length !== 0) {
        errors.userExist = true
        return res.status(400).json(errors)
      }
      
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
    })
})

router.post('/login', (req, res) => {

  const errors = {}
  const { email, password } = req.body

  const checkUserQuery = `select uid, password from users where email='${email}'`
  mysql.query(
    checkUserQuery,
    (err, result, fields) => {

      if(err)
        return console.log(err)

      if(result.length === 0) {
        errors.userExist = false
        return res.status(404).json(errors)
      }

      bcrypt
        .compare(password, result[0].password)
        .then(isMatch => {
          if(!isMatch) {
            errors.password = 'Incorrect password.'
            return res.status(400).json(errors)
          }

          const payload = {
            uid: result[0].uid
          }

          jwt.sign(payload, secretOrKey, { expiresIn: 3600 }, (err, token) => {
            if(err)
              return console.log(err)

            res.json({
              token: 'Bearer ' + token
            })
          })
        })
        .catch(err => console.log(err))
    }
  )
})

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => res.json(req.user))

module.exports = router
