const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/add', (req, res) => {

  const errors = {}
  User
    .findOne({ username: req.username })
    .then(user => {
      if(user) {
        errors.unameAvailable = false
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

module.exports = router
