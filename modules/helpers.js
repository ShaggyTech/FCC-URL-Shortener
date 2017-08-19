'use strict'

// Validates a url and simply returns that url if it is valid, else returns undefined
const validUrl = require('valid-url')

const validate = (url) => {
  return new Promise((resolve, reject) => {
    resolve(validUrl.isWebUri(url))
  })
}

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