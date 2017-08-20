'use strict'

const validUrl = require('valid-url')

// Validates a url and simply returns that url if it is valid, else returns undefined
const validate = (url) => {
  return new Promise((resolve, reject) => {
    resolve(validUrl.isWebUri(url))
  })
}

// Wraps the routes to catch any errors that were bubbled up from the route async functions
const asyncErrorCatcher = (fn) => {  
  return (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch(err => next(err));
    }
  }
}

const Helpers = {
  validate: validate,
  asyncErrorCatcher: asyncErrorCatcher
}

module.exports = Helpers