/**
 * Inside the folder utils, create a file db.js that contains the class DBClient.
 * DBClient should have:
 * the constructor that creates a client to MongoDB:
 * host: from the environment variable DB_HOST or default: localhost
 * port: from the environment variable DB_PORT or default: 27017
 * database: from the environment variable DB_DATABASE or default: files_manager
 * a function isAlive that returns true when the connection to MongoDB is a success otherwise, false
 * an asynchronous function nbUsers that returns the number of documents in the collection users
 * an asynchronous function nbFiles that returns the number of documents in the collection files
 * After the class definition, create and export an instance of DBClient called dbClient.
 */

const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new MongoClient(this.url, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
