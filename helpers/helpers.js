const mysql = require('../config/mysql')
const uniqid = require('uniqid')

module.exports = {
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
  getTimetableID: function(uid) {

    return new Promise((resolve, reject) => {
      var ttid
      const checkQuery = `select ttid from profile where uid = '${uid}'`
      mysql
        .query(checkQuery)
        .then(result => {
          if(result[0].ttid.length === 0) {
            ttid = uniqid.process()
            var query = `update profile set ttid='${ttid}' where uid = '${uid}'`
            return mysql.query(query)
          }
          resolve(result[0].ttid)
        })
        .then(() => resolve(ttid))
        .catch(err => reject(err))
    })
  }
}