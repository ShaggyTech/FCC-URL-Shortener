/*

function get(key) {
  return new Promise(function (resolve, reject) {
    try {
      if (typeof(key) !== "string") {
        reject(new DatastoreKeyNeedToBeStringException(key));
      } else {
        collection.findOne({"key":key}, function (err, data) {
          if (err) {
            reject(new DatastoreUnderlyingException(key, err));
          } else {
            try {
              if(data===null){
                resolve(null);
              }
              else{
                resolve(JSON.parse(data.value));
              }
            } catch (ex) {
              reject(new DatastoreDataParsingException(data.value, ex));
            }
          }
        });
      }
    } catch (ex) {
      reject(new DatastoreUnknownException("get", {"key": key}, ex));
    }
  });
}


*/



'use strict'

const mongo = require("mongodb"),
      rw = require("random-word")

const MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DBPORT+'/'+process.env.DB

let collection;

//       find(collection, shortUrl, what we're returning)
function find(value) {
  return new Promise(function (resolve, reject) {
    try {
      collection.findOne({short: value},{_id: 0}, function(err, result){
        if (err) reject("Databse Error: " + err)
        else {
          try {
            if (result === null) resolve(null)
            else resolve(result)
          }
          catch(ex) {
            reject("Database Ex: " + ex);
          }
        }
      })
    } 
    catch(ex) {
      reject("Database Ex: " + ex)
    }
  })
}

function connect() {
  return new Promise(function (resolve, reject) {
    try {
      console.log("Connecting.....")
      mongo.MongoClient.connect(MONGODB_URI, function(err, db) {
        if(err) reject(err);
        collection = db.collection(process.env.COLLECTION);
        console.log("Collection Saved");
        resolve(collection);
      });
    } catch(ex) {
      reject("Error connecting to the database!");
    }
  });
}

var findOriginal = function(db, url, callback) {
  db.collection(process.env.COL).findOne( {
    short: {$eq: url}
  }, {
    _id: 0
  }, function(err, result){
    if (err) throw err
    if (result) callback(result.original)
    else callback(false)
  });
};

var findShort = function(db, url, callback) {
  db.collection(process.env.COL).findOne({
    original: {$eq: url}
  }, {
    _id: 0
  }, function(err, result){
    if (err) throw err
    if (result) callback(result.short)
    else callback(false)
  })
}

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

var Datastore = {
  //set: set,
  //get: get,
  //remove: remove,
  //removeMany: removeMany,
  find: find,
  connect: connect
}

module.exports = Datastore
