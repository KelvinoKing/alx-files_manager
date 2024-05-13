/**
 * Inside the folder controllers, create a file AppController.js
 * that contains the definition of the 2 endpoints:
 * GET /status should return if Redis is alive and if the DB is alive too
 * by using the 2 utils created previously: { "redis": true, "db": true } with a status code 200
 * GET /stats should return the number of users and files in DB: { "users": 12, "files": 1231 }
 * with a status code 200
 * users collection must be used for counting all users
 * files collection must be used for counting all files
 */

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();

    res.status(200).send({ redis, db });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    res.status(200).send({ users, files });
  }
}

export default AppController;
