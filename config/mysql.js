const sql = require('mysql')

const config = {
  host: 'localhost',
  user: 'kashif',
  password: 'batman',
  database: 'att_book'
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
