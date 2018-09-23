const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const uniqid = require('uniqid')

const router = express.Router()
const mysql = require('../config/mysql')
const secretOrKey = require('../config/keys').secretOrKey


// ROUTES.
router.post('/add', (req, res) => {

  const error = {}
  const { email, password } = req.body

  // check if user exists
  const checkUserQuery = `select uid from users where email = '${email}'`
  mysql
    .query(checkUserQuery)
    .then(result => {

      if(result.length !== 0) {
        error.msg = 'E-mail is already registered.'
        res.status(400).json(error)
        return
      }

      // add user to database with unset password
      const addUserQuery = `insert into users values('${uniqid.process()}', '${email}', 'unset')`
      return mysql.query(addUserQuery)
    })
    .then(result => {
      if(!result)
        return

      // hash password and update
      bcrypt
        .genSalt(10)
        .then(salt => {
          return bcrypt.hash(password, salt)
        })
        .then(hash => {
          // update password in the column
          const updatePasswordQuery = `update users set password='${hash}' where email='${email}'`
          return mysql.query(updatePasswordQuery)
        })
        .then(result => {
          return res.json(result)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/login', (req, res) => {

  const error = {}
  const { email, password } = req.body

  const checkUserQuery = `select uid, password from users where email='${email}'`
  mysql
    .query(checkUserQuery)
    .then((result, field) => {
      
      if(result.length === 0) {
        error.msg = 'User not found.'
        return res.status(404).json(error)
      }
      
      bcrypt
        .compare(password, result[0].password)
        .then(isMatch => {
          if(!isMatch) {
            error.msg = 'Incorrect password.'
            return res.status(400).json(error)
          }

          const payload = {
            uid: result[0].uid
          }

          jwt.sign(payload, secretOrKey, { expiresIn: 86400 }, (err, token) => {
            if(err)
              return console.log(err)

            res.json({ token: 'Bearer ' + token })
          })
        })
    })
    .catch(err => console.log(err))
})

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => res.json(req.user))

module.exports = router
