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
  validateTimetableAdd: function(JSONdata) {

    const errors = {}
    let data = {}

    try {
      data = JSON.parse(JSONdata)
    } catch(err) {
      console.log(err)
      errors.msg = 'Invalid JSON.'
      return {
        errors,
        isValid: false
      }
    }

    let classes = []
    const days = Object.keys(data)[0]
    if(!isEmpty(days))
      classes = Object.keys(data[days])

    if(isEmpty(days))
      errors.data = 'No days to insert.'
    else if(isEmpty(classes))
      errors.data = 'No classes to insert.'

    return {
      data,
      errors,
      isValid: isEmpty(errors)
    }
  },
  validateDay: function(data) {

    const errors = {}
    const day = isEmpty(data) ? '' : data

    if(validator.isEmpty(day))
      errors.day = 'No day selected.'

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
  validateAttendanceSet: function(JSONdata) {

    const errors = {}
    let data = {}
    try {
      data = JSON.parse(JSONdata)
    } catch(err) {
      console.log(err)
      errors.data = 'Invalid JSON.'
      return {
        errors,
        isValid: false
      }
    }

    const { subject, timeFrom, timeTo, _date } = data
    if(validator.isEmpty(subject))
      errors.subject = 'No subject selected.'
    if(validator.isEmpty(timeFrom))
      errors.timeFrom = 'No time-slot selected.'
    if(validator.isEmpty(timeTo))
      errors.timeTo = 'No time-slot selected.'
    if(validator.isEmpty(_date))
      errors._date = 'No date selected.'
    if(!errors._date && !validator.isISO8601(_date))
      errors._date = 'Usage: (YYYY-MM-DD)'

    return {
      data,
      errors,
      isValid: isEmpty(errors)
    }
  }
}
