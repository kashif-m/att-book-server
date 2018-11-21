const sql = require('mysql')

const config = {
  host: 'sql12.freemysqlhosting.net',
  user: require('./keys').MySQL_USER,
  password: require('./keys').MySQL_PASS,
  database: 'sql12266392'
}

const connection = sql.createConnection(config)
module.exports = {
  connection,
  query: function(SQLQuery, args) {
    return new Promise((resolve, reject) => {
      connection.query(SQLQuery, (err, result, field) => {
        if(err)
          return reject(err)

        resolve(result, field)
      })
    })
  }
}
