const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// CORS configuration reading CLIENT_URL (with localhost in non-production)
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "";
const configuredOrigins = clientUrl
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:5173", "http://127.0.0.1:5173"]
    : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or requests without origin (e.g. mobile apps, curl, PayHere IPN)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    // Allow all in development if no client URL is explicitly configured
    if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS requests across all routes
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Serverless-safe MongoDB connection middleware before API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payhere", require("./routes/payhere"));
app.use("/api/workshops", require("./routes/workshops"));
app.use("/api/events", require("./routes/workshops"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/analytics", require("./routes/analytics"));

// Run listen only when file is executed directly (local development)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;