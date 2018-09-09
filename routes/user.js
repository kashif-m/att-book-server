const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.post('/add', (req, res) => {

  const errors = {}
  User
    .findOne({ email: req.body.email })
    .then(user => {
      if(user) {
        errors.emailRegistered = true
        return res.status(400).json(errors)
      }

      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => res.status(400).json(err))
        })
    })
  })
  .catch(err => res.status(400).json(err))
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
