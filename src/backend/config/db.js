const mongoose = require("mongoose");
const dns = require("dns");

// Fallback DNS servers for Node's c-ares resolver when local resolver
// (127.0.0.1) refuses SRV queries. This helps resolve MongoDB +srv URIs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

/**
 * Global cache for MongoDB connection across serverless invocations.
 * In serverless environments, global/module scope persists across
 * function invocations on warmed-up execution containers.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      console.log("MongoDB Connected Successfully 🚀");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;