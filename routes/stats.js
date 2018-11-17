const express = require('express')
const dateFns = require('date-fns')
const passport = require('passport')

const mysql = require('../config/mysql')
const router = express.Router()

router.get('/overall', passport.authenticate('jwt', { session: false }), (req, res) => {

  const uid = req.user.uid
  
  const fetchQuery = `SELECT sName, count(*) as total,
      count( CASE WHEN present = 1 then 'present' END ) as present,
      count( CASE WHEN pending = 1 then 'pending' END ) as pending,
      count( CASE WHEN present = 0 AND pending = 0 then 'absent' END ) as absent
      FROM attendance a, subjects s, profile p
      WHERE p.uid = '${uid}' AND
      a.aid = p.aid AND
      s.sid = a.sid
      GROUP BY sName ORDER BY sName`

  mysql
    .query(fetchQuery)
    .then(result => {
      const overallStats = {}
      result.map(row => {
        const { sName, total, present, pending, absent } = row
        overallStats[sName] = {
          total,
          present,
          pending,
          absent
        }
      })

      res.json(overallStats)
    })
    .catch(err => console.log(err))
})

module.exports = router
