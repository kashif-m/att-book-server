const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const sqlString = require('sqlstring')
const validator = require('validator')

const router = express.Router()
const secretOrKey = require('../config/keys').secretOrKey
const mysql = require('../config/mysql')
const transporter = require('../config/nodemailer')

router.post('/send', (req, res) => {

  const { email } = req.body

  const errors = {}
  if(validator.isEmpty(email))
    errors.email = 'Please enter your e-mail.'
  if(!errors.email && !validator.isEmail(email))
    errors.email = 'Please enter a valid e-mail.'

  if(Object.keys(errors).length !== 0)
    return res.status(400).json(errors)

  const checkUserQuery = `select uid, passHash from user where email = ${sqlString.escape(email)}`
  mysql
    .query(checkUserQuery)
    .then(result => {

      if(result.length === 0)
        return res.status(400).json({msg: 'Account not found.'})

      const { uid, passHash } = result[0]
      const payload = {
        uid,
        passHash
      }

      jwt.sign(payload, secretOrKey, { expiresIn: 86400 }, (err, token) => {
        if(err)
          return console.log(err)

        const resetURL = `http://localhost:3002/password-reset/update/${token}`
        res.json(token)

        transporter.sendMail({
          from: 'mkkashif745@gmail.com',
          to: email,
          subject: 'Password Reset for Attendance Notebook.',
          text: resetURL
        }, function(err, info) {
          if(err)
            return res.json({msg: 'failed'})

          res.json(token)
        })
    })
  })
})

verifyJwt = (query, passHash) =>
  new Promise((resolve, reject) => {
    mysql.query(query)
      .then(result =>
          result.length === 0 ? reject('invalid')
          : result[0].passHash !== passHash ? reject('invalid')
          : resolve(result[0].uid)
      )
      .catch(err => reject(err))
  })

router.post('/verify', passport.authenticate('jwt', {session: false}), (req, res) => {

  const { user } = req
  const { passHash } = req.body
  const checkUserQuery = `select uid, passHash from user where uid = '${user.uid}'`
  verifyJwt(checkUserQuery, passHash)
    .then(() => res.json({ msg: 'valid' }))
    .catch(err => res.json({ msg: err }))
})

router.post('/update', passport.authenticate('jwt', {session: false}), (req, res) => {

  const { user, body } = req
  const { password, passHash } = body
  let errors = ''
  if(validator.isEmpty(password))
    errors = 'Please enter your password.'

  console.log(errors)
  if(errors === '' && !validator.isLength(password, {min: 6, max: 30}))
    errors = 'Password must be between 6 and 30 characters long.'

  if(errors !== '')
    return res.status(400).json(errors)

  const uid = user.uid

  const checkUserQuery = `select uid, passHash from user where uid = '${uid}'`
  verifyJwt(checkUserQuery, passHash)
    .then(() => bcrypt.genSalt(10))
    .then(salt => bcrypt.hash(password, salt))
    .then(hash => {
      const updatePasswordQuery = `update user set passHash = '${hash}' where uid = '${uid}'`
      return mysql.query(updatePasswordQuery)
    })
    .then(result => res.json(result))
    .catch(err => res.json({ msg: err }))
})

module.exports = router
