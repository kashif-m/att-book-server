const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const mysql = require('./mysql')

const secretOrKey = require('./keys').secretOrKey
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = secretOrKey

module.exports = passport => {
  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {

    const searchUserQuery = `select * from users where uid = '${jwtPayload.uid}'`
    mysql.query(
      searchUserQuery,
      (err, result, field) => {
        if(err)
          return console.log(err)

        if(result) {
          
          const user = {
            uid: result[0].uid,
            email: result[0].email
          }
          return done(null, user)
        }
          
        console.log(result)
        return done(null, false)
      }
    )
  }))
}
