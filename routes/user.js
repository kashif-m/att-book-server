const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const uniqid = require('uniqid')

const router = express.Router()
const mysql = require('../config/mysql')
const secretOrKey = require('../config/keys').secretOrKey

// validators
const { validateRegister, validateLogin } = require('../validation/validators')

router.post('/register', (req, res) => {

  const { errors, isValid } = validateRegister(req.body)
  if(!isValid)
    return res.status(400).json(errors)

  const { email, password } = req.body
  const checkUserQuery = `select uid from user where email = '${email}'`
  mysql
    .query(checkUserQuery)
    .then(result => {

      if(result.length !== 0) {
        errors.msg = 'E-mail is already registered.'
        res.status(400).json(errors)
        return
      }
      var date = new Date()
      const dd = date.getDate()
      const mm = date.getMonth() + 1
      const yyyy = date.getFullYear()
      date = `${yyyy}-${mm}-${dd}`
      // add user to database with unset password
      const addUserQuery = `insert into user values('${uniqid.process()}', '${email}', 'unset', '${date}')`
      return mysql.query(addUserQuery)
    })
    .then(result => {
      if(!result)
        return
      // hash password and update
      bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))      // return hash
        .then(hash => {
          // update password with hash in the column
          const updatePasswordQuery = `update user set passHash='${hash}' where email='${email}'`
          return mysql.query(updatePasswordQuery)
        })
        .then(result => res.json(result))               // respond with result
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/login', (req, res) => {

  const { errors, isValid } = validateLogin(req.body)
  if(!isValid)
    return res.status(400).json(errors)

  const { email, password } = req.body
  const checkUserQuery = `select uid, passHash from user where email='${email}'`
  mysql
    .query(checkUserQuery)
    .then(result => {

      if(result.length === 0) {
        errors.msg = 'User not found.'
        return res.status(404).json(errors)
      }
      // use bcrypt to compare the passwords
      bcrypt
        .compare(password, result[0].passHash)
        .then(isMatch => {
          if(!isMatch) {
            errors.msg = 'Incorrect password.'
            return res.status(400).json(errors)
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
