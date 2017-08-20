'use strict'

// NPM Packages
const mongo = require('mongodb'),
      rw = require('random-word'),
      Helpers = require('./helpers')

// URI string used to connect to the mongodb service - this app uses mlab.com
const MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DBPORT+'/'+process.env.DB;

// Populated when connect() is called
let collection,    // Stores the database collection for persistent use
    appHostname;   // The hostname of this app, used when storing the short url

// Inserts a new urls object into the database collection
// Returns urls after document insertion completes
const insert = (value) => {
  const urls = 
    {
     original: value,
     short: `${appHostname}${rw()}-${rw()}`
    }
  return (collection.insertOne({original: urls.original, short: urls.short}), urls)
}

// Returns the complete database object (excluding the _id field) if the key:value was found
// Returns undefined if there was no match in the database
const find = (key, value) => {
  return collection.findOne({[key]: {$eq: value}},{_id: 0})
}

// Called when a request to '/new/<url>' is made
const newUrl = async (url) => {
  const found = await find('original', url)  // the found document
  const valid = await Helpers.validate(url)  // the url if valid
  
  if (found) return found  // returns the found document
  else if (valid) return await insert(url)  // returns the inserted document object 
  else return `{Error: ${url} is not a valid URL}` // url was not found and not valid
}

// Called once after the first request is made to the server
// Saves a copy of the database collection and the app's hostname
const connect = async (hostname) => {
  appHostname = await Promise.resolve(hostname)
  console.log('Connecting to the database.....')
  const db = await mongo.MongoClient.connect(MONGODB_URI)
  collection = db.collection(process.env.COLLECTION)
  console.log('Database Collection Saved')
  return collection
}

var Database = {
  insert: insert,
  find: find,
  newUrl: newUrl,
  connect: connect
}

module.exports = Database