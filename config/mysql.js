const sql = require('mysql')

const config = {
  host: 'sql12.freemysqlhosting.net',
  user: require('./keys').MySQL_USER,
  password: require('./keys').MySQL_PASS,
  database: 'sql12266392'
}

const pool = sql.createPool(config)

module.exports = {
  query: function(SQLQuery) {

    return new Promise((resolve, reject) => {
      pool.getConnection(function(err, connection) {
        if(err)
          return reject(err)
        
        connection.query(SQLQuery, (err, results, fields) => {
          connection.release()
          
          if(err)
            return reject(err)

          resolve(results, fields)
        })
      })
    })
  }
}
