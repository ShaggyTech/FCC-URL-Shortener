'use strict'

// NPM Packages
const mongo = require('mongodb'),
      rw = require('random-word');

// URI string used to connect to the mongodb service - this app uses mlab.com
const MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DBPORT+'/'+process.env.DB;

// These are both populated when connect() is called
let collection,    // Stores the database collection for persistent use
    appHostname;   // The hostname of this app, used when storing the short url

// Inserts a new urls object into the database collection
function insert(value) {
  const urls = {
               original: value,
               short: `${appHostname}${rw()}-${rw()}`
             };
  
  return new Promise((resolve, reject) => {
    try {
      collection.insertOne( {
        original: urls.original,
        short: urls.short
      }, (err, result) => {
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

// Returns the complete database object (excluding the _id field) if the key:value was found
// Returns null if there was no match in the database
function find(key, value) {
  return new Promise((resolve, reject) => {
    try {
      collection.findOne({[key]: {$eq: value}},{_id: 0}, (err, result) => {
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

// Called after the Express app has started
// Saves a copy of the database collection and the app's hostname
function connect(hostname) {
  return new Promise((resolve, reject) => {
    try {
      console.log("Connecting to the database.....")
      mongo.MongoClient.connect(MONGODB_URI, (err, db) => {
        if(err) reject(err);
        appHostname = hostname;
        collection = db.collection(process.env.COLLECTION);
        console.log("DB Collection Saved");
        resolve(collection);
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