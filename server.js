'require strict'

const express = require('express'),
      Database = require('./models/database'),
      Helpers = require('./models/helpers'),
      app = express();

let initialized = false;

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html')
})

app.route('/new/*').get(function(req, res) {
  try {
    Helpers.validate(encodeURI(req.params[0]))
    .then ((validUrl) => {
      if (validUrl) {
        try {
          Database.find('original', validUrl)
          .then((found) => {
            if (found) res.json(found)
            else {
              try {
              Database.insert(validUrl)
              .then((inserted) => {
                res.json(inserted)
              })
              } catch (err) {
              res.json('Find Error: ' + err)
              }    
          }
          })
        } catch(err) {
          res.json('/new/* error: ' + err)
        }
      }
      else {
        res.json({"Error": encodeURI(req.params[0]) + ' is not a valid URL'})
      }
    })
  } catch(err) {
    res.json('/new/* Error: ' + err);
  }
})

app.route('/:short').get(function(req, res) {
  try {
      Database.find('short', `${process.env.APPURL}${req.params.short}`)
        .then(function(found){
          if (found) res.redirect(encodeURI(found['original']))
          else res.json({'Error': 'That Short URL is not valid'})
        })
  } catch (err) {
    console.log("Database Error: " + err)
    res.json("Databse Error: " + err)
  }
})

// listen for requests and connect to the database if this is the first connection
let listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (!initialized) {
    try {
      initialized = Database.connect(process.env.APPURL)
    } catch (err) {
      console.log("Database Connection Error: " + err)
    }
  }
})