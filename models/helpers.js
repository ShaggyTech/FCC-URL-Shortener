'use strict'
const validUrl = require('valid-url');

var validate = (url) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(validUrl.isWebUri(url))
    } catch(err) {
      reject("Validate Error: " + err)
    }  
  })
}

var Helpers = {
  validate: validate
}

module.exports = Helpers