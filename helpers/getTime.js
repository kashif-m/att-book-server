const mysql = require('../config/mysql')
const uniqid = require('uniqid')

module.exports = getTimeID = (timeFrom, timeTo) => {

  return new Promise((resolve, reject) => {
    
    const checkTimeQuery = `select timeid from time_data where timeFrom = '${timeFrom}' and timeTo = '${timeTo}'`
    
      mysql.query(
        checkTimeQuery,
        (err, result, fields) => {
          if(err)
            return reject(console.log(err))

          console.log(result)
          if(result.length !== 0)
            return resolve(result[0].timeid)

          const timeid = uniqid.process()
          const insertTimeQuery = `insert into time_data values('${timeid}', '${timeFrom}', '${timeTo}')`
          mysql.query(
            insertTimeQuery,
            (err, result) => {
              if(err)
                return reject(console.log(err))

              resolve(timeid)
            }
          )
        }
      )
  })
}
