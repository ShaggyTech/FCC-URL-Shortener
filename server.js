'require strict'

const express = require('express'),
      validUrl = require("valid-url"),
      Database = require('./models/database'),
      app = express();

let connected = false;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  if (!connected) {
    try {
      connected = Database.connect()
      .then(function() {
        res.sendFile(__dirname + '/views/index.html')
      })
    } catch (err) {
      console.log("Database Error: " + err)
      res.json("Database Error: " + err)
    }
  } else res.sendFile(__dirname + '/views/index.html')
})

app.route("/new/*").get(function(req, res) {
  let longUrl = encodeURI(req.params[0]);
  
  if (!validUrl.isWebUri(longUrl)) res.send({"error": "Invalid URL was entered"});
  
  try {
      Database.find('original', longUrl)
        .then(function(found){
          if (found) res.json(found)
          else try {
            Database.insert(longUrl)
              .then(function(inserted) {
                res.json(inserted)
              })
          } catch (err) {
            res.json("Find Error: " + err)
          }    
        })
  } catch (err) {
    console.log("Find Error: " + err)
    res.json("Find Error: " + err)
  }
})

app.route('/:short').get(function(req, res) {
  try {
      Database.find('short', req.params.short)
        .then(function(found){
          if (found) res.redirect(encodeURI(found["original"]))
          else res.redirect('/')
        })
  } catch (err) {
    console.log("Database Error: " + err)
    res.json("Databse Error: " + err)
  }
});

// listen for requests :)
let listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});