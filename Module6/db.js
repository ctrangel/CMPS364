const { MongoClient } = require("mongodb");

let dbConnection;
const uri = "mongodb://localhost:27017/DB_uno"; // Update this with your actual MongoDB URI

function connectToDb(callback) {
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
      dbConnection = client.db("DB_uno");
      return callback();
    })
    .catch((err) => {
      console.error("Failed to connect to the database.", err);
      return callback(err);
    });
}

function getDb() {
  return dbConnection;
}

module.exports = { connectToDb, getDb };
