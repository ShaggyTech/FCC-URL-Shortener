'use strict'

const validUrl = require('valid-url')

// Validates a url and simply returns that url if it is valid, else returns undefined
const validate = (url) => {
  return new Promise((resolve, reject) => {
    resolve(validUrl.isWebUri(url))
  })
}

// Still need to implement this as the error catcher for all routes
function asyncWrap(fn) {  
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  }
}

const Helpers = {
  validate: validate,
  asyncWrap: asyncWrap
}

module.exports = Helpers