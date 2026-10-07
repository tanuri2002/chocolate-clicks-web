const mongoose = require("mongoose");
const dns = require("dns");

// Fallback DNS servers for Node's c-ares resolver when local resolver
// (127.0.0.1) refuses SRV queries. This helps resolve MongoDB +srv URIs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully 🚀");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;