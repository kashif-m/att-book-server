const sql = require('mysql')

const connection = sql.createConnection({
                        host: 'localhost',
                        user: 'kashif',
                        password: 'batman',
                        database: 'att_book'
                      })
module.exports = connection
