# Zoventro API (Node.js Migration)

This project is a migration of the Zoventro Laravel backend to Node.js + TypeScript.

## Tech Stack
- **Node.js** & **TypeScript**
- **Express** (Framework)
- **MySQL** (Database) via **mysql2** (raw SQL, prepared statements)
- **JWT** (Authentication)
- **Socket.IO** (Real-time)

## Folder Structure
- `src/config`: Database and app configuration
- `src/controllers`: API logic
- `src/routes`: API route definitions
- `src/socket`: Real-time event handlers
- `src/utils`: Helper functions and response formatters

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd apis
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=""
   DB_NAME=db_name
   PORT=5000
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

3. **Run the Project**
   Development mode:
   ```bash
   npm run dev
   ```
   Production build:
   ```bash
   npm run build
   npm start
   ```

## API Documentation
The APIs follow the same structure as the original Laravel implementation under the `/v1` prefix.
A Postman collection is available at `Postman_Collection.json`.
