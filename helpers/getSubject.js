const mysql = require('../config/mysql')
const uniqid = require('uniqid')

module.exports = {

  getSubjectID: function(subject) {
    
    return new Promise((resolve, reject) => {
      const checkSubjectQuery = `select sid from subjects where sname = '${subject}'`
      mysql
        .query(checkSubjectQuery)
        .then(result => {
          
          if(result.length !== 0)
            return resolve(result[0].sid)
          
          const sid = uniqid.process()
          const insertSubjectQuery = `insert into subjects values('${sid}', '${subject}')`
          mysql
            .query(insertSubjectQuery)
            .then(() => resolve(sid))
        })
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
  }
}
