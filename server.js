'require strict'

// NPM Packages and other 
const express = require('express'),
      Database = require('./modules/database'),  // Database functions
      Helpers = require('./modules/helpers'),
      app = express();

// Lets us know if Database.connect() has been called once since the app started
let initialized = false;

// Static Home page
app.use(express.static('public'));

// Enter a new url and have it shortened
// the '*' must be a valid url (beginning with https:// or http://)
app.get('/new/*', Helpers.asyncErrorCatcher(async (req, res, next) => {
  const url = encodeURI(req.originalUrl.substring(5))
  Database.newUrl(url)
  .then((result) => {
    res.json(result)
  }).catch(next)
}))

// Enter a short url and redirect to the long url if it was found.
app.get('/:short', Helpers.asyncErrorCatcher(async (req, res, next) => {
  Database.find('short', `${process.env.APPURL}${req.params.short}`)
  .then((found) => {
    if (found) res.redirect(encodeURI(found['original']))
    else res.json({'Error': 'That Short URL was not found'})
  }).catch(next)
}))

// Do something with the caught errors from Helpers.asyncErrorCatcher()
app.use((err, req, res, next) => {  
  console.error(err.stack)
  res.json({Error: 'An Application Error has occured, please see the server logs for details'})
})

// Listen for requests and saves the DB collection information if this is the first connection
const server = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + server.address().port);
  if (!initialized) {
    return Database.connect(process.env.APPURL)
    .then(() => {
      initialized = true
    })
    .catch((err) => {
      console.error('Database Connection Error: ' + err.stack)
      server.close(
        console.error('Server Closed')
      )
    })
  }
})