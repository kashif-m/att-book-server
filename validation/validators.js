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
  }
}
