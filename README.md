# Files Manager

This project is a back-end implementation focusing on file management, authentication, and background processing. It's intended for educational purposes to consolidate knowledge in authentication, NodeJS, MongoDB, Redis, pagination, and background processing. 

## Overview

The project aims to build a simple platform for file uploading and viewing, incorporating user authentication, file listing, file upload, permission management, file viewing, and thumbnail generation for images.

## Learning Objectives

By the end of this project, you're expected to understand:

- Creating an API with Express
- User authentication methods
- Data storage using MongoDB
- Temporary data storage with Redis
- Background worker setup and usage

## Technologies Used

- JavaScript (ES6)
- NodeJS
- ExpressJS
- MongoDB
- Redis
- Kue (for background processing)

## Requirements

- Allowed editors: vi, vim, emacs, Visual Studio Code
- All files interpreted/compiled on Ubuntu 18.04 LTS using Node (version 12.x.x)
- All files should end with a new line
- README.md file at the root of the project folder is mandatory
- Code should use the `.js` extension
- Code will be verified against lint using ESLint

## Resources

Read or watch:

- [Node.js Getting Started](https://nodejs.org/en/docs/guides/getting-started-guide/)
- [Express Getting Started](https://expressjs.com/en/starter/installing.html)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Bull Documentation](https://optimalbits.github.io/bull/)
- [Image Thumbnail](https://www.npmjs.com/package/image-thumbnail)
- [Mime-Types](https://www.npmjs.com/package/mime-types)

## Project Structure

### utils/redis.js

Contains a class `RedisClient` for handling Redis connections and operations.

### utils/db.js

Contains a class `DBClient` for managing MongoDB connections and database operations.

### server.js

Contains the Express server setup.

### routes/index.js

Contains all endpoints of the API.

### controllers/AppController.js

Contains endpoint definitions for `/status` and `/stats`.

### controllers/UsersController.js

Contains endpoint definitions for user creation, authentication, and retrieval.

### controllers/AuthController.js

Contains endpoint definitions for user authentication and token management.

### controllers/FilesController.js

Contains endpoint definitions for file management, including upload, listing, retrieval, publishing, unpublishing, and thumbnail generation.

## Tasks

1. **Redis utils**: Implementation of Redis client and utilities.
2. **MongoDB utils**: Implementation of MongoDB client and utilities.
3. **First API**: Setting up the Express server and API endpoints.
4. **Create a new user**: Endpoint to create new users in the database.
5. **Authenticate a user**: Endpoint for user authentication and token generation.
6. **First file**: Endpoint for file upload and management.
7. **Get and list file**: Endpoints for retrieving and listing files.
8. **File publish/unpublish**: Endpoints for changing file visibility.
9. **File data**: Endpoint for accessing file data.
10. **Image Thumbnails**: Background processing for generating thumbnails for image files.

## Usage

1. Clone the repository: `git clone https://github.com/alx-files_manager`
2. Install dependencies: `npm install`
3. Run the server: `npm start`

## Contributors

- Kelvino Gachihi

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
