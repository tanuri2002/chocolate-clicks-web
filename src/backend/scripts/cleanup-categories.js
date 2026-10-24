/**
 * One-time migration script to clean up the eventcategories collection.
 * 
 * What it does:
 * 1. Deletes all categories except "Sri Lankan Wes Mask Painting" and "Bake It Happen"
 * 2. Removes the `priceInfo` and `slug` fields from the remaining 2 categories
 * 
 * Run with: node src/backend/scripts/cleanup-categories.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI not found in .env");
  process.exit(1);
}

const KEEP_CATEGORIES = ["Sri Lankan Wes Mask Painting", "Bake It Happen"];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collection = db.collection("eventcategories");

  // 1. Delete categories not in our keep list
  const deleteResult = await collection.deleteMany({
    name: { $nin: KEEP_CATEGORIES },
  });
  console.log(`Deleted ${deleteResult.deletedCount} unwanted categories`);

  // 2. Remove priceInfo and slug fields from the remaining categories
  const updateResult = await collection.updateMany(
    {},
    { $unset: { priceInfo: "", slug: "" } }
  );
  console.log(`Updated ${updateResult.modifiedCount} categories (removed priceInfo & slug)`);

  // 3. Show what's left
  const remaining = await collection.find({}).toArray();
  console.log("\nRemaining categories:");
  remaining.forEach((cat) => {
    console.log(`  - ${cat.name}: "${cat.description}"`);
  });

  await mongoose.disconnect();
  console.log("\nDone! Disconnected from MongoDB.");
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
