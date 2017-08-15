'require strict'

var express = require('express');
var mongo = require("mongodb");
var rw = require("random-word");
var validUrl = require("valid-url");
var Database = require('./models/database')
var app = express();

var connected = false;

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DBPORT+'/'+process.env.DB;

var insertUrl = function(db, longUrl, callback) {
  
  var urls = {
               original: longUrl,
               short: `${rw()}-${rw()}`
             };
  
  db.collection(process.env.COL).insertOne( {
      original: urls.original,
      short: urls.short
   }, function(err, result) {
    if (err) throw err
    console.log("Inserted a document into the url collection.");
    callback(urls);
  });
};

var findShort = function(db, url, callback) {
  db.collection(process.env.COL).findOne({
    "urls.original": {$eq: url}
  }, {
    _id: 0
  }, function(err, result){
    if (err) throw err
    if (result) callback(result.urls[0])
    else callback(false)
  })
}

var findOriginal = function(db, url, callback) {
  db.collection(process.env.COL).findOne( {
    "urls.short": {$eq: url},
  }, {
    _id: 0
  }, function(err, result){
    if (err) throw err
    if (result) callback(result.urls[0]["original"])
    else callback(false)
  });
};

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  
  if (!connected) {
    try {
      Database.connect().
      then(function() {
        res.sendFile(__dirname + '/views/index.html');
      })
    } catch (err) {
      console.log("Error: " + err);
      res.json(`Error: ${err}`);
    }
  } else res.sendFile(__dirname + '/views/index.html');
});

app.route("/new/*").get(function(req, res) {
  var longUrl = encodeURI(req.params[0]);
  
  if (!validUrl.isWebUri(longUrl)) res.send({"error": "Invalid URL was entered"}).end();
  else mongo.MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    findShort(db, longUrl, function(urlObj) {
      if (urlObj) {
        db.close();
        res.send(urlObj);
      } 
      else {
        insertUrl(db, longUrl, function(urlObj) {
          db.close();
          res.send(urlObj);
        });
      }
    });
  });
});

app.route("/:short").get(function(req, res) {
  try {
      Database.find(req.params.short)
        .then(function(urlObj){
          if (urlObj) res.redirect(encodeURI(urlObj["original"]))
          else res.redirect('/')
        })
  } catch (err) {
    console.log("Error: " + err);
    res.json(`Error: ${err}`);
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});