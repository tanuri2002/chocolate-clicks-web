# Complete Backend Authentication Setup Guide

## Step-by-Step Installation & Setup

### 1. **Setup MongoDB Atlas (Cloud Database)**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account
   - Create a new cluster
   - Get your connection string: `mongodb+srv://username:password@cluster0.mongodb.net/chocolate-clicks?retryWrites=true&w=majority`

### 2. **Create .env File**
   - In `src/backend/`, create a `.env` file (copy from `.env.example`)
   - Add your MongoDB URI:
     ```
     MONGO_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/chocolate-clicks?retryWrites=true&w=majority
     JWT_SECRET=chocolate-clicks-secret-key-2024
     PORT=5000
     NODE_ENV=development
     ```

### 3. **Install Backend Dependencies**
   ```bash
   cd src/backend
   npm install
   ```
   
   All required packages are already in package.json:
   - `express` - Server framework
   - `mongoose` - MongoDB ODM
   - `bcrypt` - Password hashing
   - `jsonwebtoken` - JWT authentication
   - `cors` - Cross-Origin Resource Sharing
   - `dotenv` - Environment variables

### 4. **Start the Backend Server**
   ```bash
   npm start
   # or use: node server.js
   ```
   
   You should see: `Server running on port 5000`

### 5. **API Endpoints Available**

   #### Signup (Create Account)
   ```
   POST http://localhost:5000/api/auth/signup
   
   Request Body:
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "confirmPassword": "password123"
   }
   
   Response:
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "fullName": "John Doe",
       "email": "john@example.com"
     },
     "message": "User registered successfully"
   }
   ```

   #### Login (Get Token)
   ```
   POST http://localhost:5000/api/auth/login
   
   Request Body:
   {
     "email": "john@example.com",
     "password": "password123"
   }
   
   Response:
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "fullName": "John Doe",
       "email": "john@example.com"
     },
     "message": "Login successful"
   }
   ```

   #### Get Current User (Protected Route)
   ```
   GET http://localhost:5000/api/auth/me
   
   Headers:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   
   Response:
   {
     "success": true,
     "user": {
       "_id": "507f1f77bcf86cd799439011",
       "fullName": "John Doe",
       "email": "john@example.com",
       "phone": "",
       "address": "",
       "createdAt": "2024-05-02T10:30:00Z"
     }
   }
   ```

### 6. **How Authentication Works**

   1. **User Signs Up**: Password is hashed with bcrypt, user saved to MongoDB
   2. **User Logs In**: Password verified against hash, JWT token generated
   3. **Token Storage**: Frontend stores JWT in localStorage
   4. **Protected Routes**: Include token in `Authorization: Bearer <token>` header
   5. **Token Expiry**: Token expires in 7 days (configurable)

### 7. **File Structure**
   ```
   src/backend/
   ├── config/
   │   └── db.js                 # MongoDB connection
   ├── middleware/
   │   └── auth.js              # JWT verification middleware
   ├── models/
   │   └── User.js              # User schema & methods
   ├── routes/
   │   └── auth.js              # Signup, login, me endpoints
   ├── .env                      # Your secrets (DON'T commit)
   ├── .env.example              # Template
   ├── server.js                 # Express server entry point
   └── package.json
   ```

### 8. **Testing with Postman or cURL**
   
   **Test Signup:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "confirmPassword": "password123"
     }'
   ```

   **Test Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "password123"
     }'
   ```

### 9. **Frontend Integration**
   - Updated `Login.jsx` and `SignUp.jsx` to use new endpoints
   - JWT token stored in localStorage as `token`
   - API calls include `Authorization: Bearer <token>` header automatically
   - User info accessible via `/api/auth/me` endpoint

### 10. **Security Best Practices**
   - Never commit `.env` file to git
   - Use strong JWT_SECRET in production
   - Use HTTPS in production
   - Set CORS_ORIGIN to your frontend domain only
   - Implement rate limiting for auth endpoints
   - Add email verification for signup
   - Implement refresh tokens for better security

