'require strict'

// NPM Packages and other 
const express = require('express'),
      Database = require('./modules/database'),  // Database functions
      app = express();

// Lets us know if Database.connect() has been called once since the app started
let initialized = false;

// Static Home page
app.use(express.static('public'));

// Enter a new url and have it shortened
// the '*' must be a valid url (beginning with https:// or http://)
app.get('/new/*', (req, res) => {
  const url = encodeURI(req.originalUrl.substring(5))
  Database.newUrl(url)
  .then((result) => {
    res.json(result)
  })
  .catch((err) => res.json(`{'Error Inserting A New URL': ${err}`))
})

// Enter a short url and redirect to the long url if it was found.
app.route('/:short').get((req, res) => {
  //  APPURL example: https://gigantic-honey.glitch.me/
  Database.find('short', `${process.env.APPURL}${req.params.short}`)
  .then((found) => {
    if (found) res.redirect(encodeURI(found['original']))
    else res.json({'Error': 'That Short URL is not valid'})
  })
  .catch(err => res.json({'Error finding short URL': err}))
})

// Listen for requests and connect to the database if this is the first connection
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
  if (!initialized) {
    Database.connect(process.env.APPURL)
    .then(() => {
      initialized = true
    })
    .catch((err) => console.log('Database Connection Error: ' + err))
  }
})
