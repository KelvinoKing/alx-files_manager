/**
 * Inside server.js, create the Express server:
 * it should listen on the port set by the environment variable PORT or by default 5000
 * it should load all routes from the file routes/index.js
 */

import express from 'express';
import router from './routes/index';

const server = express();
const port = process.env.PORT || 5000;

server.use(express.json());
server.use('/', router);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
