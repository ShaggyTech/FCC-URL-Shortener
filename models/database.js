'use strict'

const mongo = require("mongodb"),
      rw = require("random-word")

const MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DBPORT+'/'+process.env.DB

let collection,
    hostname;

function insert(value) {
  const urls = {
               original: value,
               short: `${hostname}${rw()}-${rw()}`
             };
  
  return new Promise(function(resolve, reject) {
    try {
      collection.insertOne( {
        original: urls.original,
        short: urls.short
      }, function(err, result) {
        if (err) reject("Insert Error: " + err)
        else {
          try {
            console.log("Inserted a document into the url collection.")
            resolve(urls)
          } catch(ex) {
            reject("Insert Ex: " + ex)
          }
        }  
      })
    }
    catch(ex) {
      reject("Insert Ex: " + ex)
    }
  })
}

function find(key, value) {
  return new Promise(function (resolve, reject) {
    try {
      collection.findOne({[key]: {$eq: `${hostname}${value}`}},{_id: 0}, function(err, result){
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

function connect(reqHostname) {
  return new Promise(function (resolve, reject) {
    try {
      console.log("Connecting to the database.....")
      mongo.MongoClient.connect(MONGODB_URI, function(err, db) {
        if(err) reject(err);
        else {
          try {
            hostname = `https://${reqHostname}/`;
            collection = db.collection(process.env.COLLECTION);
            console.log("Collection Saved");
            resolve(collection);
          }
          catch(ex) {
            reject("Datbase Ex: " + ex)
          }
        }
      });
    } catch(ex) {
      reject("Error connecting to the database!");
    }
  });
}

var Datastore = {
  insert: insert,
  find: find,
  connect: connect
}

module.exports = Datastore
