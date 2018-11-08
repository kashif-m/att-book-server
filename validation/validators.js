const validator = require('validator')

const isEmpty = value =>
value === undefined ||
value === null ||
(typeof value === 'object' && Object.keys(value).length === 0) ||
(typeof value === 'string' && value.trim().length === 0)


module.exports = {
  validateRegister: function(data) {
    
    const errors = {}
    const email = isEmpty(data.email) ? '' : data.email
    const password = isEmpty(data.password) ? '' : data.password

    if(validator.isEmpty(email))
      errors.email = 'Please enter your e-mail.'
    if(!errors.email && !validator.isEmail(email))
      errors.email = 'Please enter a valid e-mail.'
    if(validator.isEmpty(password))
      errors.password = 'Please enter your password.'
    if(!errors.password && !validator.isLength(password, {min: 6, max: 30}))
      errors.password = 'Password must be between 6 and 30 characters long.'

    return {
      errors,
      isValid: isEmpty(errors)
    }
  },
  validateLogin: function(data) {

    const errors = {}
    const email = isEmpty(data.email) ? '' : data.email
    const password = isEmpty(data.password) ? '' : data.password

    if(validator.isEmpty(email))
      errors.email = 'Please enter your e-mail.'
    if(!errors.email && !validator.isEmail(email))
      errors.email = 'Please enter a valid e-mail.'
    if(validator.isEmpty(password))
      errors.password = 'Please enter your password.'
    if(!errors.password && !validator.isLength(password, {min: 6, max: 30}))
      errors.password = 'Password must be between 6 and 30 characters long.'

    return {
      errors,
      isValid: isEmpty(errors)
    }
  },
  validateTimetableAdd: function(data) {

    const errors = {}

    let classes = []
    console.log
    const days = Object.keys(data.timetable)[0]
    if(!isEmpty(days))
      classes = Object.keys(data.timetable[days])

    if(isEmpty(days))
      errors.data = 'No days to insert.'
    else if(isEmpty(classes))
      errors.data = 'No classes to insert.'

    return {
      errors,
      isValid: isEmpty(errors)
    }
  },
  validateTag: function(data) {

    const errors = {}
    const day = isEmpty(data) ? '' : data

    if(validator.isEmpty(day))
      errors.day = 'No tag found.'

    return {
      errors,
      isValid: isEmpty(errors)
    }
  },
  validateDate: function(data) {

    const errors = {}
    const date = isEmpty(data) ? '' : `'${data}'`

    if(validator.isEmpty(date))
      errors.date = 'No date selected.'
    if(!errors.date && validator.isISO8601(date))
      errors.date = 'Usage: (YYYY-MM-DD)'

    return {
      errors,
      isValid: isEmpty(errors)
    }      
  },
  validateAttendanceSet: function(data) {

    const errors = {}
    const { classNo, _date, status, subject } = data
    if(!classNo)
      errors.classNo = 'No class selected.'
    if(validator.isEmpty(subject))
      errors.subject = 'No subject selected.'
    if(validator.isEmpty(status))
      errors.status = 'No status.'
    if(validator.isEmpty(_date))
      errors._date = 'No date selected.'
    if(!errors._date && !validator.isISO8601(_date))
      errors._date = 'Usage: (YYYY-MM-DD)'

    return {
      errors,
      isValid: isEmpty(errors)
    }
  }
}
