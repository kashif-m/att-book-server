const mysql = require('../config/mysql')
const uniqid = require('uniqid')

module.exports = getSubjectID = subject => {

  return new Promise((resolve, reject) => {

    const checkSubjectQuery = `select sid from subjects where sname = '${subject}'`
    mysql.query(
      checkSubjectQuery,
      (err, result) => {
        if(err)
          return reject(console.log(err))
        
        if(result.length !== 0)
          return resolve(result[0].sid)
        
        const sid = uniqid.process()
        const insertSubjectQuery = `insert into subjects values('${sid}', '${subject}')`
        mysql.query(
          insertSubjectQuery,
          (err) => {
            if(err)
              return reject(console.log(err))
            
            resolve(sid)
          }
        )
      }
    )
  })
}
