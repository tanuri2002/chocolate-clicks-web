const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("role");
      if (!user) {
        return res.status(401).json({ success: false, message: "User account not found" });
      }
      req.user = { id: user._id.toString(), role: user.role };
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Token is not valid" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized to access this route" });
  }
  return next();
};
