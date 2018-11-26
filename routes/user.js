const bcrypt = require('bcryptjs')
const dateFns = require('date-fns')
const express = require('express')
const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')
const passport = require('passport')
const sqlString = require('sqlstring')
const transporter = require('../config/nodemailer')
const uniqid = require('uniqid')

const router = express.Router()
const mysql = require('../config/mysql')
const secretOrKey = require('../config/keys').secretOrKey

// validators
const { validateUserForm } = require('../validation/validators')

router.post('/register', (req, res) => {

  const { errors, isValid } = validateUserForm(req.body)
  if(!isValid)
    return res.status(400).json(errors)

  let { email, password } = req.body, uid
  const checkUserQuery = `select uid from user where email = ${sqlString.escape(email)}`
  mysql
    .query(checkUserQuery)
    .then(result => {

      if(result.length !== 0) {
        errors.msg = 'E-mail is already registered.'
        return res.status(400).json(errors)
      }

      bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => {
          uid = uniqid.process()
          const addUserQuery = `insert into user values('${uid}', ${sqlString.escape(email)}, '${hash}')`
          return mysql.query(addUserQuery)    
        })
        .then(() => {
          const date = dateFns.format(new Date(), 'YYYY-MM-DD')
          const insertProfileQuery = `insert into profile values('${uid}', ${false}, '${date}')`
          return mysql.query(insertProfileQuery)    
        })
        .then(result => {
          
          const payload = {
            uid,
            verified: false
          }
          jwt
            .sign(payload, secretOrKey, {expiresIn: 86400}, (err, token) => {
              if(err)
                return console.log(err)

              const verificationURL = `http://localhost:5000/user/verify/${token}`
              transporter.sendMail({
                  from: 'mkkashif745@gmail.com',
                  to: email,
                  subject: 'Attendance Notebook verification.',
                  text: verificationURL
                }, function(err, info) {
                  if(err)
                    return console.log(err)
              })
              
              res.json(result)
            })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/login', (req, res) => {

  const { errors, isValid } = validateUserForm(req.body)
  if(!isValid)
    return res.status(400).json(errors)

  const { email, password } = req.body
  const checkUserQuery = `select uid, passHash from user where email = ${sqlString.escape(email)}`
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

router.get('/verify/:token', (req, res) => {

  const token = req.params.token

  try {
    const decoded = jwtDecode(token)

    const { uid, verified } = decoded
    const checkUserQuery = `select verified from profile where uid = ${sqlString.escape(uid)}`
    
    mysql
      .query(checkUserQuery)
      .then(result => {
        if(result.length === 0)
          return res.send('Invalid link.')

        if(verified !== (result[0].verified === 1))
          return res.send('Invalid link.')

        const updateProfileQuery = `UPDATE profile set verified = ${true} WHERE uid = '${uid}'`
        mysql
          .query(updateProfileQuery)
          .then(() => res.send('Successfully verified.'))
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  } catch(err) {
    res.send('Invalid link.')
  }
})

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => res.json(req.user))

router.delete('/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  const { user } = req
  
  const deleteQuery = `DELETE from user where uid = '${user.uid}'`
  mysql
    .query(deleteQuery)
    .then(result => res.json(result))
    .catch(err => res.json(err))
})

module.exports = router
