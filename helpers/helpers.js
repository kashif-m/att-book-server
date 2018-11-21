const mysql = require('../config/mysql')
const uniqid = require('uniqid')

module.exports = {
  getSubjectID: function(subject) {

    return new Promise((resolve, reject) => {

      const checkSubjectQuery = `select sid from subject where sname = '${subject}'`
      var sid
      mysql
        .query(checkSubjectQuery)
        .then(result => {
          if(result.length !== 0)
            return resolve(result[0].sid)

          sid = uniqid.process()
          const insertSubjectQuery = `insert into subject values('${sid}', '${subject}')`
          return mysql.query(insertSubjectQuery)
        })
        .then(() => resolve(sid))
        .catch(err => reject(err))
    })
  },
  getSubject: function(sid) {

    return new Promise((resolve, reject) => {
      const fetchSubject = `select sname from subject where sid = '${sid}'`
      mysql
        .query(fetchSubject)
        .then(result => resolve(result[0].sname))
        .catch(err => reject(err))
    })
  },
  getTimetableID: function(uid) {

    return new Promise((resolve, reject) => {
      const selectQuery = `select ttid from profile where uid = '${uid}'`
      mysql
        .query(selectQuery)
        .then(result => resolve(result[0].ttid))
        .catch(err => reject(err))
    })
  },
  getAttendanceID: function(uid) {

    return new Promise((resolve, reject) => {
      const selectQuery = `select aid from profile where uid = '${uid}'`
      mysql
        .query(selectQuery)
        .then(result => resolve(result[0].aid))
        .catch(err => reject(err))
    })
  }
}