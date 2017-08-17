'require strict'

// NPM Packages and other 
const express = require('express'),
      Database = require('./modules/database'),  // Database functions
      Helpers = require('./modules/helpers'),    // Helper functions
      app = express();

// Lets us know if Database.connect() has been called once since the app started
let initialized = false;

// Static Home page
app.use(express.static('public'));
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// Enter a new url and have it shortened
// the '*' must be a valid url (beginning with https:// or http://)
app.route('/new/*').get((req, res) => {
  try {
    Helpers.validate(encodeURI(req.params[0]))  // validate the requested long url
    .then ((validUrl) => {                      // promise returns the long url if it is valid
      if (validUrl) {
        try {
          Database.find('original', validUrl)   // try to find the long url in the database
          .then((found) => {                    // returns complete found db document (excluding _id) || returns false 
            if (found) res.json(found)          // send the found document to the browser
            else {
              try {
              Database.insert(validUrl)         // if the url wasn't found then lets insert it into the database
              .then((inserted) => {             
                res.json(inserted)              // send the inserted document to the browser
              })
              } catch (err) {
              res.json('DB Insertion Error: ' + err)
              }    
          }
          })
        } catch(err) {
          res.json('URL Validation Error: ' + err)
        }
      }
      else {
        // if the entered long url is not valid then let the user know
        res.json({"Error": encodeURI(req.params[0]) + ' is not a valid URL'})
      }
    })
  } catch(err) {
    res.json('/new/* Error: ' + err);
  }
})

// Enter a short url and redirect to the long url if it was found.
app.route('/:short').get((req, res) => {
  /* 
  **  The shortened url is stored in the database using this app's hostname + the short phrase.
  **  Example: "short": "https://gigantic-honey.glitch.me/supersurgeon-cathead"
  **  APPURL example: https://gigantic-honey.glitch.me/
  */
  try {
      Database.find('short', `${process.env.APPURL}${req.params.short}`)
        .then((found) => {
          if (found) res.redirect(encodeURI(found['original']))
          else res.json({'Error': 'That Short URL is not valid'})
        })
  } catch (err) {
    res.json('Databse Error: ' + err)
  }
})

// Listen for requests and connect to the database if this is the first connection
let listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
  if (!initialized) {
    try {
      initialized = Database.connect(process.env.APPURL)
    } catch (err) {
      console.log('Database Connection Error: ' + err)
    }
  }
})