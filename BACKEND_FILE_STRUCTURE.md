# Backend File Structure & Explanation

## Complete Directory Structure

```
src/backend/
├── config/
│   └── db.js                    # MongoDB connection setup
├── middleware/
│   └── auth.js                  # JWT verification middleware (protect routes)
├── models/
│   └── User.js                  # User schema with password hashing & verification
├── routes/
│   └── auth.js                  # All authentication endpoints
├── .env                         # Environment variables (CREATE THIS!)
├── .env.example                 # Template for .env
├── server.js                    # Express server entry point
└── package.json                 # Project dependencies
```

---

## File-by-File Explanation

### 1. **config/db.js** - Database Connection
```javascript
// What it does:
- Connects to MongoDB using Mongoose
- Sets up DNS fallback for cloud databases
- Logs connection status

// When it runs:
- Automatically when server.js starts
```

### 2. **models/User.js** - User Data Schema
```javascript
// Defines what data a user has:
- fullName (required)
- email (required, unique)
- password (hidden by default)
- phone (optional)
- address (optional)
- timestamps (createdAt, updatedAt)

// Special Features:
- Password automatically hashed before saving
- Methods:
  - matchPassword() → compare entered password with stored hash
  - Used for login verification
```

### 3. **middleware/auth.js** - Authentication Guard
```javascript
// What it does:
- Checks if request has valid JWT token
- Verifies token signature
- Extracts user ID from token

// Used for protecting routes:
- GET /api/auth/me (protected)
- Any future admin/user-only routes

// How it works:
1. Check Authorization header: "Bearer <token>"
2. Verify token with JWT_SECRET
3. Attach decoded user to request object (req.user)
4. Pass to next middleware/route
```

### 4. **routes/auth.js** - All Auth Endpoints

#### POST /api/auth/signup
```
Purpose: Register a new user
Input: fullName, email, password, confirmPassword
Process:
  1. Validate all fields provided
  2. Check if email already exists
  3. Create new User (password auto-hashes in model)
  4. Generate JWT token (expires in 7 days)
  5. Return token + user info
Output: { success, token, user }
```

#### POST /api/auth/login
```
Purpose: Authenticate existing user
Input: email, password
Process:
  1. Find user by email
  2. Compare entered password with stored hash using bcrypt
  3. If match, generate JWT token
  4. Return token + user info
Output: { success, token, user }
```

#### GET /api/auth/me (Protected)
```
Purpose: Get current logged-in user's data
Input: Authorization header with token
Process:
  1. Middleware verifies token validity
  2. Extract user ID from token
  3. Fetch user from database
Output: { success, user }
Requires: Valid JWT token
```

### 5. **server.js** - Express Application

```javascript
// What it does:
- Creates Express server
- Connects to MongoDB
- Sets up middleware (CORS, JSON parser)
- Registers routes
- Starts listening on port 5000

// Middleware stack:
cors() → express.json() → Routes → Error Handler
```

### 6. **.env** - Configuration (YOU CREATE THIS)

```
MONGO_URI=mongodb+srv://...  # Your MongoDB connection string
JWT_SECRET=your-secret-key   # Secret for signing tokens
PORT=5000                     # Server port
NODE_ENV=development          # Environment
```

---

## How Data Flows Through the System

### Signup Flow:
```
SignUp.jsx
  ↓ form submission
apiCall('/auth/signup', 'POST', userData)
  ↓ 
api.js → fetch to http://localhost:5000/api/auth/signup
  ↓
server.js → Route: POST /api/auth/signup
  ↓
auth.js (route handler)
  ↓ Validate & Hash Password
User.js (Mongoose model)
  ↓ Save to MongoDB
Generate JWT Token
  ↓
Response back to frontend
  ↓
SignUp.jsx stores token & redirects
```

### Login Flow:
```
Login.jsx
  ↓ form submission
apiCall('/auth/login', 'POST', {email, password})
  ↓
api.js → fetch to http://localhost:5000/api/auth/login
  ↓
server.js → Route: POST /api/auth/login
  ↓
auth.js (route handler) → Verify password
User.js → Find user & compare password hash
Generate JWT Token
  ↓
Response with token
  ↓
Login.jsx stores token & redirects
```

### Protected Route Flow:
```
Dashboard.jsx
  ↓ component mounts
apiCall('/auth/me', 'GET')
  ↓
api.js adds Authorization header: "Bearer <token>"
  ↓
server.js → Route: GET /api/auth/me
  ↓
auth.js middleware → verify token
  ↓ If valid:
Let request pass through
  ↓
Return user data
  ↓ If invalid:
Return 401 error
Auto-logout & redirect to login
```

---

## Key Technology Stack

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Express** | Web framework | Easy to use, minimal & flexible |
| **Mongoose** | MongoDB ODM | Schema validation, type safety |
| **bcrypt** | Password hashing | Industry standard, salted hashing |
| **JWT** | Token-based auth | Stateless, scales well, secure |
| **CORS** | Cross-origin requests | Allow frontend to call backend |
| **dotenv** | Env variables | Keep secrets out of code |

---

## Security Features Implemented

✅ **Password Security:**
- Passwords never stored plain text
- Hashed with bcrypt using salt (10 rounds)
- Passwords excluded from default queries

✅ **Token Security:**
- JWT signed with secret
- Token expires in 7 days
- Token verified on every protected request

✅ **Database Security:**
- Email validation (proper format check)
- Email uniqueness enforced
- Required field validation

✅ **API Security:**
- CORS enabled to prevent cross-site attacks
- JSON body parser prevents code injection
- Error messages don't leak sensitive info

---

## Example: Adding a New Protected Route

If you want to add a route that only logged-in users can access:

```javascript
// routes/users.js
const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Protected route - only logged-in users
router.get("/profile", protect, async (req, res) => {
  try {
    // req.user has the user ID from the JWT token
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

Then in `server.js`:
```javascript
app.use("/api/users", require("./routes/users"));
```

Now call it from frontend:
```javascript
const user = await apiCall("/users/profile", "GET");
// api.js automatically adds the token!
```

