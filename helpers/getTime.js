const mysql = require('../config/mysql')
const uniqid = require('uniqid')

module.exports = {

  getTimeID: function(timeFrom, timeTo) {

    return new Promise((resolve, reject) => {
      const checkTimeQuery = `select timeid from time_data where timeFrom = '${timeFrom}' and timeTo = '${timeTo}'`    
      mysql
        .query(checkTimeQuery)
        .then(result => {

          if(result.length !== 0)
            return resolve(result[0].timeid)
          
          const timeid = uniqid.process()
          const insertTimeQuery = `insert into time_data values('${timeid}', '${timeFrom}', '${timeTo}')`
          mysql
            .query(insertTimeQuery)
            .then(result => resolve(timeid))
            .catch(err => reject(err))
        })
        .catch(err => reject(err))
    })
  },
  getTime: function(timeid) {

    return new Promise((resolve, reject) => {
      const fetchTime = `select timeFrom, timeTo from time_data where timeid = '${timeid}'`
      mysql
        .query(fetchTime)
        .then(result => resolve(result[0].timeid))
        .catch(err => reject(err))
    })
  }
}
