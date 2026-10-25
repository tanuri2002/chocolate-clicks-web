const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { protect } = require("../middleware/auth");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

let rateLimit;
try {
  rateLimit = require("express-rate-limit");
} catch {
  // fallback if package not installed
}

const router = express.Router();

const passwordResetLimiter = rateLimit
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
    })
  : (req, res, next) => next();

const authLimiter = rateLimit
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50, // limit to 50 attempts per 15 minutes
      message: { success: false, message: "Too many authentication requests. Please try again later." }
    })
  : (req, res, next) => next();



// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const matchesSecret = (provided, expected) => {
  if (typeof provided !== "string" || typeof expected !== "string") return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phoneNo, address } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    user = await User.create({
      fullName,
      email,
      password,
      phoneNo,
      address,
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists (select password field explicitly since it's hidden by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate with Google OAuth ID token (Customer login/signup)
// @access  Public
router.post("/google", authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google ID token credential is required",
      });
    }

    const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
    if (!clientId) {
      console.error("GOOGLE_WEB_CLIENT_ID is not configured in backend .env");
      return res.status(500).json({
        success: false,
        message: "Google authentication is not properly configured on server",
      });
    }

    // Verify Google ID token cryptographically
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google authentication token",
      });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Failed to retrieve verified profile from Google",
      });
    }

    // Ensure email is verified by Google
    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Your Google email address is not verified by Google",
      });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Your account has been deactivated. Please contact support.",
        });
      }

      // Security: Disallow admin elevation/hijacking via customer Google login
      if (user.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "This email is registered to an Administrator. Please use administrator credentials to sign in.",
        });
      }

      // Link googleId and avatar if not set
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        needsSave = true;
      }
      if (payload.picture && (!user.avatar || user.avatar !== payload.picture)) {
        user.avatar = payload.picture;
        needsSave = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // New user registering via Google: always created as customer
      user = await User.create({
        fullName: payload.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId: payload.sub,
        authProvider: "google",
        avatar: payload.picture || "",
        isEmailVerified: true,
        role: "customer",
      });
    }

    // Issue JWT
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
      message: "Google authentication successful",
    });
  } catch (error) {
    console.error("Google auth route error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during Google authentication",
    });
  }
});

router.post("/admin-setup", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, setupSecret } = req.body;

    if (!matchesSecret(setupSecret, process.env.ADMIN_SETUP_SECRET)) {
      return res.status(403).json({ success: false, message: "Invalid admin setup secret" });
    }

    if (await User.exists({ role: "admin" })) {
      return res.status(409).json({ success: false, message: "An admin account already exists" });
    }

    if (!fullName || !email || !password || password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Provide name, email, password, and matching confirmation" });
    }

    const user = await User.create({ fullName, email, password, role: "admin" });
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/admin-signup", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, adminSecret } = req.body;

    if (!matchesSecret(adminSecret, process.env.ADMIN_SIGNUP_SECRET)) {
      return res.status(403).json({ success: false, message: "Invalid admin signup secret" });
    }

    if (!fullName || !email || !password || password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Provide name, email, password, and matching confirmation" });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const user = await User.create({ fullName, email, password, role: "admin" });
    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        phoneNo: user.phoneNo,
        address: user.address,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email" });
    }

    const user = await User.findOne({ email });

    if (user) {
      // Generate token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hash token and set to resetPasswordToken field
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set expire (30 minutes)
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

      await user.save({ validateBeforeSave: false });

      // Create reset url
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
      const htmlMessage = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #ff9800; text-align: center;">ChocolateClicks</h2>
            <p>Hello,</p>
            <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #ff9800; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 30 minutes.</p>
            <p style="font-size: 12px; color: #888;">If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: "Password Reset Token - ChocolateClicks",
          text: message,
          html: htmlMessage,
        });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error("Email could not be sent", err);
      }
    }

    // Always send the same success message
    res.status(200).json({
      success: true,
      message: "If that account exists, we've sent a reset link.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post("/reset-password", passwordResetLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide token and new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
    }

    // Set new password
    user.password = newPassword; // The pre-save hook will hash it using bcrypt
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    // Send confirmation email
    const message = "Your password has been successfully changed.";
    const htmlMessage = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #ff9800; text-align: center;">Password Changed</h2>
          <p>Hello,</p>
          <p>Your password for ChocolateClicks has been successfully changed.</p>
          <p>If you did not make this change, please contact support immediately.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Changed - ChocolateClicks",
        text: message,
        html: htmlMessage,
      });
    } catch (err) {
      console.error("Confirmation email could not be sent", err);
    }

    res.status(200).json({
      success: true,
      message: "Password successfully updated. Please log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
