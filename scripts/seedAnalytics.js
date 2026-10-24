/**
 * scripts/seedAnalytics.js
 *
 * Development-only utility to seed realistic historical data for analytics testing.
 * Generates ~60 days of realistic orders and customers with realistic time-of-day
 * and day-of-week patterns (lunch/dinner peaks, weekend surges).
 *
 * All generated records are tagged with `isSeeded: true` so they can be
 * cleanly purged with a single command.
 *
 * Usage:
 *   node scripts/seedAnalytics.js --seed
 *   node scripts/seedAnalytics.js --clean
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(path.join(__dirname, "../src/backend/package.json"));

require("dotenv").config({ path: path.join(__dirname, "../src/backend/.env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Order = require("./models/Order");
const User = require("./models/User");
const Menu = require("./models/Menu");

const SEED_PREFIX = "seed_analytics";

const SAMPLE_CUSTOMERS = [
  { fullName: "Kasun Jayawardena", email: "kasun.j@example.com", phone: "+94771234561", address: "14/2 Galle Road, Colombo 03" },
  { fullName: "Dilani Perera", email: "dilani.p@example.com", phone: "+94719876542", address: "88 Kandy Road, Kiribathgoda" },
  { fullName: "Nuwan Samarasinghe", email: "nuwan.s@example.com", phone: "+94765432103", address: "25 Duplication Road, Colombo 04" },
  { fullName: "Shenali Fernando", email: "shenali.f@example.com", phone: "+94701234564", address: "102 Havelock Road, Colombo 05" },
  { fullName: "Malik De Silva", email: "malik.d@example.com", phone: "+94723456785", address: "45 Negombo Road, Wattala" },
  { fullName: "Tharushi Wickramasinghe", email: "tharushi.w@example.com", phone: "+94784567896", address: "17 Cotta Road, Rajagiriya" },
  { fullName: "Roshan Mendis", email: "roshan.m@example.com", phone: "+94755678907", address: "93 High Level Road, Nugegoda" },
  { fullName: "Anuki Gunaratne", email: "anuki.g@example.com", phone: "+94776789018", address: "30 Flower Road, Colombo 07" },
  { fullName: "Dinesh Ranatunga", email: "dinesh.r@example.com", phone: "+94717890129", address: "50 Baseline Road, Dematagoda" },
  { fullName: "Kavindi Alwis", email: "kavindi.a@example.com", phone: "+94768901230", address: "64 Nawala Road, Narahenpita" },
  { fullName: "Bhanuka Rajapaksa", email: "bhanuka.r@example.com", phone: "+94709012341", address: "12 Marine Drive, Bambalapitiya" },
  { fullName: "Nadeesha Senanayake", email: "nadeesha.s@example.com", phone: "+94720123452", address: "78 Pagoda Road, Nugegoda" },
  { fullName: "Sahan Abeykoon", email: "sahan.a@example.com", phone: "+94781234563", address: "55 Ward Place, Colombo 07" },
  { fullName: "Pravin Ratnayake", email: "pravin.r@example.com", phone: "+94752345674", address: "19 Parliament Road, Kotte" },
];

/**
 * Pick an hour based on realistic cafe order probability weights
 */
function pickRealisticHour() {
  const hourWeights = [
    { hour: 10, weight: 2 },
    { hour: 11, weight: 3 },
    { hour: 12, weight: 8 }, // Lunch peak
    { hour: 13, weight: 9 }, // Lunch peak
    { hour: 14, weight: 6 },
    { hour: 15, weight: 4 }, // Tea
    { hour: 16, weight: 5 },
    { hour: 17, weight: 5 },
    { hour: 18, weight: 7 }, // Dinner peak
    { hour: 19, weight: 8 }, // Dinner peak
    { hour: 20, weight: 6 },
    { hour: 21, weight: 3 },
  ];

  const totalWeight = hourWeights.reduce((s, h) => s + h.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of hourWeights) {
    if (random < item.weight) return item.hour;
    random -= item.weight;
  }
  return 14;
}

async function cleanData() {
  console.log("🧹 Cleaning seeded analytics data...");
  const orderRes = await Order.deleteMany({ isSeeded: true });
  const userRes = await User.deleteMany({ isSeeded: true });

  console.log(`✓ Removed ${orderRes.deletedCount} seeded orders.`);
  console.log(`✓ Removed ${userRes.deletedCount} seeded users.`);
  console.log("Cleanup complete!");
}

async function seedData() {
  console.log("🌱 Starting realistic analytics dataset generation (~60 days)...");

  // 1. Fetch available menu items
  let menuItems = await Menu.find({ isActive: true });
  if (menuItems.length === 0) {
    console.log("No menu items found. Creating fallback menu items for testing...");
    const fallbacks = [
      { name: "Double Chocolate Fudge Cake", category: "Cakes", price: 6500 },
      { name: "Signature Belgian Brownie", category: "Brownies", price: 1200 },
      { name: "Choco Lava Cupcake", category: "Cupcakes", price: 650 },
      { name: "Dark Chocolate Chip Cookies", category: "Cookies", price: 800 },
      { name: "Salted Caramel Cake", category: "Cakes", price: 7200 },
      { name: "Nutella Swirl Brownie", category: "Brownies", price: 1400 },
      { name: "Mocha Hazelnut Cake", category: "Coffee Cakes", price: 6800 },
    ];
    menuItems = await Menu.insertMany(fallbacks);
  }

  // 2. Clean any prior seeded data first
  await Order.deleteMany({ isSeeded: true });
  await User.deleteMany({ isSeeded: true });

  // 3. Create seeded customers
  const createdUsers = [];
  const now = new Date();

  for (let i = 0; i < SAMPLE_CUSTOMERS.length; i++) {
    const c = SAMPLE_CUSTOMERS[i];
    // Spread user registration dates across the past 60 days
    const daysAgo = Math.floor(Math.random() * 55) + 3;
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const user = await User.create({
      fullName: c.fullName,
      email: `${SEED_PREFIX}_${c.email}`,
      password: "password123", // Valid hash dummy
      role: "customer",
      phoneNo: Number(c.phone.replace(/\D/g, "")),
      address: c.address,
      createdAt,
      isSeeded: true,
    });
    createdUsers.push(user);
  }

  console.log(`✓ Created ${createdUsers.length} seeded customer accounts.`);

  // 4. Generate ~60 days of orders (from day 60 ago to today)
  const ordersToInsert = [];
  let orderSequence = 1000;

  for (let dayOffset = 60; dayOffset >= 0; dayOffset--) {
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - dayOffset);
    const dayOfWeek = orderDate.getDay(); // 0 is Sun, 6 is Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // More orders on weekends (4-8 vs 2-5 on weekdays)
    const baseOrders = isWeekend ? Math.floor(Math.random() * 5) + 4 : Math.floor(Math.random() * 4) + 2;

    for (let o = 0; o < baseOrders; o++) {
      orderSequence++;
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];

      const hour = pickRealisticHour();
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const specificOrderDate = new Date(orderDate);
      specificOrderDate.setHours(hour, minute, second, 0);

      // Pick 1 to 3 items
      const itemCount = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
      const orderItems = [];
      let calculatedTotal = 0;

      for (let k = 0; k < itemCount; k++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        const qty = Math.random() < 0.8 ? 1 : 2;
        calculatedTotal += item.price * qty;
        orderItems.push({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: qty,
        });
      }

      // Status distribution: 85% Completed, 10% Processing/Shipped/Pending, 5% Cancelled
      let status = "Completed";
      const statusRand = Math.random();
      if (statusRand < 0.05) {
        status = "Cancelled";
      } else if (dayOffset <= 1) {
        // Today or yesterday orders might be pending or processing
        status = statusRand < 0.5 ? "Pending" : statusRand < 0.8 ? "Processing" : "Completed";
      }

      const paymentStatus = status === "Cancelled" ? "cancelled" : "paid";
      const nameParts = user.fullName.split(" ");
      const datePartStr = specificOrderDate.toISOString().slice(0, 10).replace(/-/g, "");

      ordersToInsert.push({
        user: user._id,
        orderNumber: `CC-${datePartStr}-${orderSequence}`,
        items: orderItems,
        total: calculatedTotal,
        currency: "LKR",
        customer: {
          firstName: nameParts[0] || "Customer",
          lastName: nameParts.slice(1).join(" ") || "User",
          email: user.email,
          phone: String(user.phoneNo || "+94770000000"),
        },
        orderType: Math.random() < 0.65 ? "delivery" : "pickup",
        address: user.address || "Colombo, Sri Lanka",
        city: "Colombo",
        paymentStatus,
        status,
        createdAt: specificOrderDate,
        updatedAt: specificOrderDate,
        isSeeded: true,
      });
    }
  }

  const inserted = await Order.insertMany(ordersToInsert);
  console.log(`✓ Inserted ${inserted.length} realistic historical orders spanning 60 days.`);
  console.log("✨ Seeding completed successfully!");
}

async function main() {
  const arg = process.argv[2];

  if (!arg || (arg !== "--seed" && arg !== "--clean")) {
    console.log("=================================================");
    console.log("Chocolate Clicks Analytics Seed Tool");
    console.log("=================================================");
    console.log("Usage:");
    console.log("  node scripts/seedAnalytics.js --seed   (Generate 60 days of sample data)");
    console.log("  node scripts/seedAnalytics.js --clean  (Purge all seeded records)");
    console.log("=================================================");
    process.exit(0);
  }

  await connectDB();

  try {
    if (arg === "--seed") {
      await seedData();
    } else if (arg === "--clean") {
      await cleanData();
    }
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

main();
