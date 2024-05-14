/**
 * In the file routes/index.js, add a new endpoint:
 * POST /files => FilesController.postUpload
 * Inside controllers, add a file FilesController.js that contains the new endpoint:
 *
 * POST /files should create a new file in DB and in disk:
 *
 * Retrieve the user based on the token:
 * If not found, return an error Unauthorized with a status code 401
 * To create a file, you must specify:
 * name: as filename
 * type: either folder, file or image
 * parentId: (optional) as ID of the parent (default: 0 -> the root)
 * isPublic: (optional) as boolean to define if the file is public or not (default: false)
 * data: (only for type=file|image) as Base64 of the file content
 * If the name is missing, return an error Missing name with a status code 400
 * If the type is missing or not part of the list of accepted type, return
 * an error Missing type with a status code 400
 * If the data is missing and type != folder, return an error Missing data with a status code 400
 * If the parentId is set:
 * If no file is present in DB for this parentId, return an error Parent not found with a status
 * code 400
 * If the file present in DB for this parentId is not of type folder, return an error
 * Parent is not a folder with a status code 400
 * The user ID should be added to the document saved in DB - as owner of a file
 * If the type is folder, add the new file document in the DB and return the new file
 * with a status code 201
 * Otherwise:
 * All file will be stored locally in a folder (to create automatically if not present):
 * The relative path of this folder is given by the environment variable FOLDER_PATH
 * If this variable is not present or empty, use /tmp/files_manager as storing folder path
 * Create a local path in the storing folder with filename a UUID
 * Store the file in clear (reminder: data contains the Base64 of the file) in this local path
 * Add the new file document in the collection files with these attributes:
 * userId: ID of the owner document (owner from the authentication)
 * name: same as the value received
 * type: same as the value received
 * isPublic: same as the value received
 * parentId: same as the value received - if not present: 0
 * localPath: for a type=file|image, the absolute path to the file save in local
 * Return the new file with a status code 201
 *
 */

import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    if (!name) return res.status(400).send({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).send({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });

    if (parentId) {
      const parent = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parent) return res.status(400).send({ error: 'Parent not found' });
      if (parent.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
    }

    const file = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || '0',
    };

    if (type === 'folder') {
      const newFile = await dbClient.client.db().collection('files').insertOne(file);
      return res.status(201).send(newFile.ops[0]);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const localPath = `${folderPath}/${uuidv4()}`;
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(localPath, buffer);

    const newFile = { ...file, localPath };
    await dbClient.client.db().collection('files').insertOne(newFile);
    return res.status(201).send(newFile);
  }

  /**
   * GET /files/:id => FilesController.getShow
   * GET /files => FilesController.getIndex
   * In the file controllers/FilesController.js, add the 2 new endpoints:
   * GET /files/:id should retrieve the file document based on the ID:
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * If no file document is linked to the user and the ID passed as parameter,
   * return an error Not found with a status code 404
   * Otherwise, return the file document
   * GET /files should retrieve all users file documents for a specific parentId
   * and with pagination:
   *
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * Based on the query parameters parentId and page, return the list of file document
   * parentId:
   * No validation of parentId needed - if the parentId is not linked to any user folder,
   * returns an empty list
   * By default, parentId is equal to 0 = the root
   * Pagination:
   * Each page should be 20 items max
   * page query parameter starts at 0 for the first page. If equals to 1,
   * it means it’s the second page (form the 20th to the 40th), etc…
   * Pagination can be done directly by the aggregate of MongoDB} req
   */
  static async getShow(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const { id } = req.params;
    const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });

    if (!file) return res.status(404).send({ error: 'Not found' });
    return res.status(200).send(file);
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const { parentId } = req.query;
    const page = req.query.page || 0;
    const limit = 20;

    const files = await dbClient.client.db().collection('files')
      .find({ parentId: parentId || '0', userId: ObjectId(userId) })
      .limit(limit)
      .skip(page * limit)
      .toArray();

    return res.status(200).send(files);
  }

  /**
   * In the file routes/index.js, add 2 new endpoints:
   * PUT /files/:id/publish => FilesController.putPublish
   * PUT /files/:id/publish => FilesController.putUnpublish
   * In the file controllers/FilesController.js, add the 2 new endpoints:
   *
   * PUT /files/:id/publish should set isPublic to true on the file document based on the ID:
   *
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * If no file document is linked to the user and the ID passed as parameter,
   * return an error Not found with a status code 404
   * Otherwise:
   * Update the value of isPublic to true
   * And return the file document with a status code 200
   * PUT /files/:id/unpublish should set isPublic to false on the file document based on the ID:
   *
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * If no file document is linked to the user and the ID passed as parameter,
   * return an error Not found with a status code 404
   * Otherwise:
   * Update the value of isPublic to false
   * And return the file document with a status code 200
   */

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const { id } = req.params;
    const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });

    if (!file) return res.status(404).send({ error: 'Not found' });

    await dbClient.client.db().collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: true } });
    return res.status(200).send({ ...file, isPublic: true });
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const { id } = req.params;
    const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });

    if (!file) return res.status(404).send({ error: 'Not found' });

    await dbClient.client.db().collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: false } });
    return res.status(200).send({ ...file, isPublic: false });
  }

  /**
   * In the file routes/index.js, add one new endpoint:
   *
   * GET /files/:id/data => FilesController.getFile
   * In the file controllers/FilesController.js, add the new endpoint:
   *
   * GET /files/:id/data should return the content of the file document based on the ID:
   *
   * If no file document is linked to the ID passed as parameter,
   * return an error Not found with a status code 404
   * If the file document (folder or file) is not public (isPublic: false)
   * and no user authenticate or not the owner of the file,
   * return an error Not found with a status code 404
   * If the type of the file document is folder, return an error A
   * folder doesn't have content with a status code 400
   * If the file is not locally present, return an error Not found with a status code 404
   * Otherwise:
   * By using the module mime-types, get the MIME-type based on the name of the file
   * Return the content of the file with the correct MIME-type
   */

  static async getFile(req, res) {
    const { id } = req.params;
    const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id) });

    if (!file) return res.status(404).send({ error: 'Not found' });
    if (!file.isPublic) return res.status(404).send({ error: 'Not found' });

    if (file.type === 'folder') return res.status(400).send({ error: 'A folder doesn\'t have content' });

    if (!file.localPath || !fs.existsSync(file.localPath)) return res.status(404).send({ error: 'Not found' });

    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);
    return res.sendFile(file.localPath);
  }
}

export default FilesController;
