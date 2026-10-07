const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from src/backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Menu = require('../models/Menu');
const cloudinary = require('../config/cloudinary');

const ASSETS_DIR = path.resolve(__dirname, '../../assets');

// ── Raw seed items extracted from original FoodItems.jsx ─────────────────────
const SEED_DATA = [
  // ── Brownies ─────────────────────────────────────────────────────────────
  {
    category: 'Brownies',
    fallbackDesc: 'A fudgy, chocolate-loaded bake finished with a decadent topping.',
    items: [
      {
        name: 'Classic Fudge',
        price: 850,
        imageFile: 'brownie1.png',
        soldOut: false,
        description: 'Classic fudgy chocolate brownie topped with delicate chocolate drizzle.',
      },
      {
        name: 'Nutella',
        price: 950,
        imageFile: 'brownie2.jpeg',
        soldOut: true,
        description: 'Rich fudge brownie swirled with creamy Nutella hazelnut spread.',
      },
      {
        name: 'Kinder Bueno',
        price: 1050,
        imageFile: 'brownie3.jpeg',
        soldOut: false,
        description: 'Fudgy brownie loaded with hazelnut cream and crunchy Kinder Bueno.',
      },
      {
        name: 'Cookie & Brownie',
        price: 950,
        imageFile: 'brownie1.png',
        soldOut: false,
        description: 'The ultimate brookies duo — decadent fudge brownie layered with chocolate chip cookie.',
      },
      {
        name: 'Oreo Brownie',
        price: 900,
        imageFile: 'brownie2.jpeg',
        soldOut: false,
        description: 'Fudge brownie baked with crunchy Oreo cookies inside and on top.',
      },
    ],
  },

  // ── Cookies ──────────────────────────────────────────────────────────────
  {
    category: 'Cookies',
    fallbackDesc: 'Soft-baked and packed with rich chocolate in every bite.',
    items: [
      {
        name: 'Chocolate Chip',
        price: 350,
        imageFile: 'cookie1.jpeg',
        soldOut: false,
        description: 'Soft-baked golden cookie studded with molten chocolate chips.',
      },
      {
        name: 'Nutella Chocolate Chip',
        price: 450,
        imageFile: 'cookie2.jpeg',
        soldOut: false,
        description: 'Golden chocolate chip cookie filled with a rich, molten Nutella center.',
      },
      {
        name: 'Kinder Bueno Chocolate Chip',
        price: 500,
        imageFile: 'cookie3.jpeg',
        soldOut: false,
        description: 'Packed with rich chocolate chunks and topped with crispy Kinder Bueno.',
      },
      {
        name: 'Chocolate Fudge Cookie',
        price: 400,
        imageFile: 'cookie1.jpeg',
        soldOut: false,
        description: 'Double chocolate cookie with an ultra-fudgy, chewy center.',
      },
      {
        name: 'Biscoff Chocolate Chip',
        price: 480,
        imageFile: 'cookie2.jpeg',
        soldOut: true,
        description: 'Soft cookie infused with spiced Lotus Biscoff spread and chocolate chips.',
      },
    ],
  },

  // ── Vanilla Cakes ────────────────────────────────────────────────────────
  {
    category: 'Vanilla Cakes',
    fallbackDesc: 'A light vanilla sponge layered with fresh, seasonal flavor.',
    items: [
      {
        name: 'Classic Milk Vanilla',
        price: 2200,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Classic airy vanilla sponge layered with delicate whipped milk cream.',
      },
      {
        name: 'Blueberry Vanilla',
        price: 2600,
        imageFile: 'cake2.png',
        soldOut: false,
        description: 'Fluffy vanilla sponge infused with tangy wild blueberry compote.',
      },
      {
        name: 'Raspberry Vanilla',
        price: 2600,
        imageFile: 'cake3.jpeg',
        soldOut: false,
        description: 'Light vanilla sponge layered with fresh tart raspberry coulis and cream.',
      },
      {
        name: 'Fruit Salad Vanilla',
        price: 2800,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Fluffy vanilla sponge dressed with fresh tropical fruit medley.',
      },
      {
        name: 'Caramelized Nuts Loaded Vanilla',
        price: 3000,
        imageFile: 'cake2.png',
        soldOut: false,
        description: 'Vanilla sponge filled with crunchy caramelized praline nuts.',
      },
      {
        name: 'Strawberry Vanilla',
        price: 2600,
        imageFile: 'cake3.jpeg',
        soldOut: false,
        description: 'Vanilla sponge layered with sweet strawberry reduction and velvety cream.',
      },
      {
        name: 'Nutella Vanilla',
        price: 2900,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Moist vanilla sponge paired with luscious Nutella chocolate spread.',
      },
      {
        name: 'Blackberry Vanilla',
        price: 2700,
        imageFile: 'cake2.png',
        soldOut: false,
        description: 'Sweet vanilla cake balanced with rich, fragrant blackberry preserve.',
      },
      {
        name: 'Pineapple Vanilla',
        price: 2500,
        imageFile: 'cake3.jpeg',
        soldOut: false,
        description: 'Tropical pineapple chunks layered with refreshing vanilla cream.',
      },
      {
        name: 'Salted Caramel Vanilla',
        price: 2900,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Vanilla sponge drizzled with handcrafted golden salted caramel sauce.',
      },
      {
        name: 'Cherry Vanilla',
        price: 2700,
        imageFile: 'cake2.png',
        soldOut: false,
        description: 'Tender vanilla layers complemented by luscious sweet dark cherries.',
      },
    ],
  },

  // ── Coffee Cakes ─────────────────────────────────────────────────────────
  {
    category: 'Coffee Cakes',
    fallbackDesc: 'A moist coffee-infused sponge with a smooth, aromatic finish.',
    items: [
      {
        name: 'Coffee Brownie',
        price: 2600,
        imageFile: 'cafe.jpg',
        soldOut: false,
        description: 'Coffee-infused rich cake layered with decadent brownie fudge chunks.',
      },
      {
        name: 'Coffee Tiramisu',
        price: 3200,
        imageFile: 'cafe2.jpg',
        soldOut: false,
        description: 'Italian-inspired espresso sponge layered with silky mascarpone cream.',
      },
      {
        name: 'Classic Coffee',
        price: 2400,
        imageFile: 'cafe3.jpg',
        soldOut: false,
        description: 'Aromatic espresso sponge with smooth handcrafted coffee buttercream.',
      },
      {
        name: 'Coffee Caramel',
        price: 2800,
        imageFile: 'cafe.jpg',
        soldOut: false,
        description: 'Bold espresso cake layered with rich golden caramel sauce.',
      },
      {
        name: 'Coffee Nutty',
        price: 2900,
        imageFile: 'cafe2.jpg',
        soldOut: false,
        description: 'Aromatic coffee cake generously loaded with roasted crunchy nuts.',
      },
      {
        name: 'Mocha',
        price: 2700,
        imageFile: 'cafe3.jpg',
        soldOut: true,
        description: 'Harmonious blend of rich dark espresso and decadent chocolate ganache.',
      },
      {
        name: 'Coffee Cream Cheese',
        price: 3000,
        imageFile: 'cafe.jpg',
        soldOut: false,
        description: 'Coffee sponge paired with tangy, velvety cream cheese frosting.',
      },
    ],
  },

  // ── Chocolate Cakes ──────────────────────────────────────────────────────
  {
    category: 'Chocolate Cakes',
    fallbackDesc: 'A rich chocolate sponge finished with indulgent layers.',
    items: [
      {
        name: 'Oreo Chocolate',
        price: 2900,
        imageFile: 'cake2.png',
        soldOut: false,
        description: 'Decadent chocolate cake layered with cookies & cream frosting.',
      },
      {
        name: 'Snicker Cake',
        price: 3100,
        imageFile: 'cake3.jpeg',
        soldOut: false,
        description: 'Chocolate cake filled with roasted peanuts, caramel, and nougat cream.',
      },
      {
        name: 'Raspberry Chocolate',
        price: 2800,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Dark chocolate sponge paired with sweet-tart raspberry reduction.',
      },
      {
        name: 'Rich Classic Chocolate',
        price: 2500,
        imageFile: 'cake2.png',
        soldOut: false,
        description: 'Signature moist chocolate sponge draped in rich dark chocolate ganache.',
      },
      {
        name: 'Kinder Bueno Chocolate',
        price: 3200,
        imageFile: 'cake3.jpeg',
        soldOut: false,
        description: 'Layered chocolate cake with hazelnut cream and crispy Kinder wafers.',
      },
      {
        name: 'Peanut Butter Chocolate',
        price: 3000,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Rich chocolate sponge layered with creamy, salty-sweet peanut butter frosting.',
      },
      {
        name: 'Kitkat Chocolate Fudge',
        price: 3100,
        imageFile: 'cake2.png',
        soldOut: true,
        description: 'Fudge chocolate cake packed with crunchy Kitkat wafer bars.',
      },
      {
        name: 'Coffee and Chocolate',
        price: 2900,
        imageFile: 'cake3.jpeg',
        soldOut: false,
        description: 'Aromatic mocha pairing with intense chocolate fudge layers.',
      },
      {
        name: 'Chocolate & Salted Caramel',
        price: 3000,
        imageFile: 'cake.jpeg',
        soldOut: false,
        description: 'Dark chocolate cake ribboned with handcrafted sea-salt caramel sauce.',
      },
    ],
  },
];

// Cache uploaded Cloudinary URLs to prevent duplicate uploads of the same local asset
const uploadedImageCache = new Map();

async function getOrUploadImage(filename) {
  if (!filename) return '';

  if (uploadedImageCache.has(filename)) {
    return uploadedImageCache.get(filename);
  }

  const filePath = path.join(ASSETS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: Image file not found: ${filePath}. Proceeding with empty imageUrl.`);
    return '';
  }

  try {
    console.log(`📤 Uploading ${filename} to Cloudinary (folder: chocolate-clicks/menu)...`);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'chocolate-clicks/menu',
    });
    uploadedImageCache.set(filename, result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.warn(`⚠️ Warning: Cloudinary upload failed for ${filename}: ${error.message}. Proceeding with empty imageUrl.`);
    return '';
  }
}

async function seed() {
  console.log('🌱 Starting Menu Seed Script...');

  await connectDB();

  let createdCount = 0;
  let skippedCount = 0;

  for (const group of SEED_DATA) {
    console.log(`\n📂 Processing category: ${group.category}`);

    for (const item of group.items) {
      // Idempotency check: match by name and category
      const existing = await Menu.findOne({ name: item.name, category: group.category });
      if (existing) {
        console.log(`   ⏭️  [SKIP] "${item.name}" already exists.`);
        skippedCount++;
        continue;
      }

      const imageUrl = await getOrUploadImage(item.imageFile);
      const description = item.description || group.fallbackDesc;
      const inStock = !item.soldOut;

      const created = await Menu.create({
        name: item.name,
        description,
        price: item.price,
        category: group.category,
        imageUrl,
        inStock,
      });

      console.log(`   ✅ [CREATED] "${created.name}" (LKR ${created.price}) - inStock: ${created.inStock}`);
      createdCount++;
    }
  }

  console.log('\n──────────────────────────────────────────────────────────');
  console.log(`✨ Seed complete! Created: ${createdCount} | Skipped: ${skippedCount}`);
  console.log('──────────────────────────────────────────────────────────\n');

  await mongoose.connection.close();
  console.log('🔌 Database connection closed.');
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('❌ Seed script failed:', err);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});
