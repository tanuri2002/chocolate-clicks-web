# Quick Start Guide - Authentication System

## ✅ What's Been Created For You

### Backend Files:
- ✅ `src/backend/models/User.js` - User schema with password hashing
- ✅ `src/backend/middleware/auth.js` - JWT authentication middleware
- ✅ `src/backend/routes/auth.js` - Signup, login, and get user endpoints
- ✅ `src/backend/server.js` - Updated Express server with auth routes
- ✅ `src/backend/.env.example` - Environment variables template

### Frontend Files:
- ✅ `src/frontend/Login.jsx` - Updated to use new backend
- ✅ `src/frontend/SignUp.jsx` - Updated to use new backend & JWT
- ✅ `src/api.js` - Reusable API utility with automatic token handling

### Documentation:
- ✅ `BACKEND_AUTH_SETUP.md` - Complete setup guide
- ✅ `QUICK_START.md` - This file

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create .env File
```bash
cd src/backend
# Copy .env.example to .env
copy .env.example .env
```

Edit `.env` and add your MongoDB connection:
```
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/chocolate-clicks
JWT_SECRET=your-secret-key
PORT=5000
```

### Step 2: Install Dependencies
```bash
cd src/backend
npm install
```

### Step 3: Start Backend Server
```bash
npm start
```

Expected output:
```
Server running on port 5000
MongoDB Connected Successfully 🚀
```

### Step 4: Test Backend (Optional)
In a new terminal:
```bash
# Test Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Step 5: Start Frontend
```bash
# In the root directory
npm run dev
```

---

## 📱 Frontend Usage

### 1. Import API utility in your components:
```javascript
import { login, signup, logout, isAuthenticated, getCurrentUser } from '../api.js';
```

### 2. Use in your components:
```javascript
// Signup
const handleSignup = async (fullName, email, password, confirmPassword) => {
  try {
    const data = await signup(fullName, email, password, confirmPassword);
    localStorage.setItem('token', data.token);
    // Redirect to home
  } catch (error) {
    console.error(error);
  }
};

// Login
const handleLogin = async (email, password) => {
  try {
    const data = await login(email, password);
    localStorage.setItem('token', data.token);
    // Redirect to home
  } catch (error) {
    console.error(error);
  }
};

// Check if user is logged in
if (isAuthenticated()) {
  // Show user menu
}

// Get user info
const user = getCurrentUser();
console.log(user.fullName);

// Logout
const handleLogout = () => {
  logout();
  window.location.href = '/login';
};
```

### 3. Protected Routes
```javascript
import { isAuthenticated } from '../api.js';

export const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Use in App.jsx
<Route 
  path="/dashboard" 
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
/>
```

---

## 🔑 API Endpoints Reference

| Method | Endpoint | Public? | Description |
|--------|----------|---------|-------------|
| POST | `/api/auth/signup` | Yes | Create new account |
| POST | `/api/auth/login` | Yes | Login & get token |
| GET | `/api/auth/me` | No | Get current user (requires token) |

### Request/Response Examples:

**Signup Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Signup Response (Success):**
```json
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

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Response (Success):**
```json
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

---

## 🛠 Troubleshooting

### Backend won't start
```
Error: Cannot find module 'express'
```
**Fix:** Run `npm install` in `src/backend/`

### MongoDB connection failed
```
Error: MongoDB Connection Failed: connect ENOTFOUND
```
**Fix:** Check your `.env` MONGO_URI is correct

### 401 Unauthorized errors
- Token is missing or expired
- Include `Authorization: Bearer <token>` header
- API utility handles this automatically

### CORS errors
- Make sure backend is running on port 5000
- Check `cors()` is enabled in server.js ✅

---

## 📋 Next Steps

1. ✅ Start backend server
2. ✅ Test signup/login with curl or Postman
3. ✅ Try signup on frontend
4. ✅ Try login on frontend
5. Create Protected Routes for Dashboard, etc.
6. Add user profile page
7. Implement password reset
8. Add email verification

---

## 🔒 Security Reminders

- ❌ Don't commit `.env` file
- ❌ Never expose JWT_SECRET
- ✅ Use HTTPS in production
- ✅ Set strong JWT_SECRET
- ✅ Token expires in 7 days (can adjust)
- ✅ Password is hashed with bcrypt

