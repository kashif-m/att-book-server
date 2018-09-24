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
            .then(() => resolve(timeid))
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
        .then(result => resolve(result[0].timeFrom, result[0].timeTo))
        .catch(err => reject(err))
    })
  },
  getSubjectID: function(subject) {

    return new Promise((resolve, reject) => {

      const checkSubjectQuery = `select sid from subjects where sname = '${subject}'`
      var sid
      mysql
        .query(checkSubjectQuery)
        .then(result => {
          if(result.length !== 0)
            return resolve(result[0].sid)

          sid = uniqid.process()
          const insertSubjectQuery = `insert into subjects values('${sid}', '${subject}')`
          return mysql.query(insertSubjectQuery)
        })
        .then(() => resolve(sid))
        .catch(err => reject(err))
    })
  },
  getSubject: function(sid) {

    return new Promise((resolve, reject) => {
      const fetchSubject = `select sname from subjects where sid = '${sid}'`
      mysql
        .query(fetchSubject)
        .then(result => resolve(result[0].sname))
        .catch(err => reject(err))
    })
  },
  getDataID: function(uid) {

    return new Promise((resolve, reject) => {
      var dataid
      const checkQuery = `select dataid from timetable where uid = '${uid}'`
      mysql
        .query(checkQuery)
        .then(result => {
          if(result.length === 0) {
            dataid = uniqid.process()
            var query = `insert into timetable values('${uid}', '${dataid}')`
            return mysql.query(query)
          }
          resolve(result[0].dataid)
        })
        .then(() => resolve(dataid))
        .catch(err => reject(err))
    })
  }
}