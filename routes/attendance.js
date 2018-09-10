const express = require('express')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()

router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { user } = req
  const { sid, timeid, _date, present, pending } = req.body.data

})
