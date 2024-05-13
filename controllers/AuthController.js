/**
 * Inside controllers, add a file AuthController.js that contains new endpoints:
 * GET /connect should sign-in the user by generating a new authentication token:
 * By using the header Authorization and the technique of the Basic auth
 * (Base64 of the <email>:<password>), find the user associate to this email
 * and with this password (reminder: we are storing the SHA1 of the password)
 * If no user has been found, return an error Unauthorized with a status code 401
 * Otherwise:
 * Generate a random string (using uuidv4) as token
 * Create a key: auth_<token>
 * Use this key for storing in Redis (by using the redisClient create previously) the
 * user ID for 24 hours
 * Return this token: { "token": "155342df-2399-41da-9e8c-458b6ac52a0c" } with a status code 200
 * Now, we have a way to identify a user, create a token (= avoid to store the password on
 * any front-end) and use this token for 24h to access to the API!
 * Every authenticated endpoints of our API will look at this token inside the header X-Token.
 *
 * GET /disconnect should sign-out the user based on the token:
 * Retrieve the user based on the token:
 * If not found, return an error Unauthorized with a status code 401
 * Otherwise, delete the token in Redis and return nothing with a status code 204
 */

import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authorization = req.header('Authorization');
    if (!authorization || !authorization.startsWith('Basic ')) return res.status(401).send({ error: 'Unauthorized' });

    const credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    if (!email || !password) return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.client.db().collection('users').findOne({ email, password: sha1(password) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 86400);

    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
