# MongoDB Entities & Features for Chocolate Clicks Web

## Core Entities (Collections)

### 1. **users**
**Purpose:** Authentication, profiles, delivery addresses, preferences  
**Fields:**
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique, indexed),
  passwordHash: String,
  phone: String,
  role: String // "user" | "admin" (default: "user")
  
  // Profile
  profileImage: String (URL),
  bio: String,
  
  // Addresses (multi-valued)
  addresses: [
    {
      _id: ObjectId,
      label: String, // "Home" | "Work" | "Other"
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      latitude: Number,
      longitude: Number,
      isDefault: Boolean,
      createdAt: Date
    }
  ],
  
  // Preferences
  preferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    pushNotifications: Boolean,
    dietaryRestrictions: [String] // ["vegan", "gluten-free", "nut-free"]
  },
  
  // Account Status
  isActive: Boolean,
  lastLogin: Date,
  emailVerified: Boolean,
  phoneVerified: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- email (unique)
- createdAt (-1)
- lastLogin (-1)

**Features:**
- User authentication & authorization
- Multiple shipping addresses
- Dietary preferences tracking
- Account activation/verification
- User activity tracking

---

### 2. **products**
**Purpose:** Food items and mask/workshop materials catalog  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Basic Info
  sku: String (unique),
  name: String,
  description: String,
  category: String, // "food" | "mask" | "material"
  subCategory: String, // "chocolate" | "snack" | "n95" | "cloth" etc
  
  // Images & Media
  images: [
    {
      url: String,
      alt: String,
      isPrimary: Boolean
    }
  ],
  
  // Pricing & Cost
  price: Decimal128,
  costPrice: Decimal128,
  discount: {
    percentage: Number, // 0-100
    flatAmount: Decimal128,
    active: Boolean,
    validFrom: Date,
    validTo: Date
  },
  
  // Product Details
  attributes: {
    // For food
    flavor: String,
    weight: String,
    expiryDate: Date,
    ingredients: [String],
    allergens: [String],
    nutritionInfo: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number
    },
    
    // For masks/materials
    size: String, // "S", "M", "L", "XL"
    color: String,
    material: String,
    thickness: Number,
    quantity: Number // pieces per pack
  },
  
  // Inventory
  stock: Number,
  reservedStock: Number,
  lowStockThreshold: Number,
  reorderLevel: Number,
  reorderQuantity: Number,
  
  // Supplier
  supplier: {
    supplierId: ObjectId,
    name: String,
    sku: String
  },
  
  // Status & Metadata
  isActive: Boolean,
  isFeatured: Boolean,
  rating: {
    average: Number, // 0-5
    count: Number
  },
  
  // Tags & SEO
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  slug: String (unique),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastRestocked: Date
}
```
**Indexes:**
- sku (unique)
- slug (unique)
- category (1), subCategory (1)
- isActive (1), stock (1) // partial index for active products
- createdAt (-1)
- price (1) // for sorting
- text index on name, description

**Features:**
- Product catalog with multi-image support
- Dynamic pricing with discounts
- Inventory management
- Nutrition & allergen info (for food)
- Stock alerts & reorder tracking
- SEO optimization
- Product ratings/reviews count
- Multi-supplier support

---

### 3. **categories**
**Purpose:** Product categorization & organization  
**Fields:**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  parentId: ObjectId, // null for top-level
  icon: String, // URL or icon name
  image: String, // category banner image
  displayOrder: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- slug (unique)
- parentId (1)
- displayOrder (1)

**Features:**
- Hierarchical category structure
- Category SEO
- Visual representation (icons/images)
- Ordering & visibility control

---

### 4. **carts**
**Purpose:** Shopping cart (session or user-based)  
**Fields:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String, // for anonymous users
  
  items: [
    {
      _id: ObjectId,
      productId: ObjectId,
      nameSnapshot: String, // snapshot at add time
      priceSnapshot: Decimal128, // snapshot at add time
      quantity: Number,
      discount: Decimal128,
      selectedOptions: {
        size: String,
        flavor: String,
        color: String
      },
      addedAt: Date
    }
  ],
  
  // Totals
  subtotal: Decimal128,
  tax: Decimal128,
  shippingEstimate: Decimal128,
  discount: Decimal128,
  total: Decimal128,
  
  // Metadata
  couponCode: String,
  expiresAt: Date, // TTL
  lastModified: Date
}
```
**Indexes:**
- userId (1)
- sessionId (1)
- expiresAt (1) // TTL index: { expireAfterSeconds: 604800 }

**Features:**
- User & guest cart support
- Item snapshots (preserve price history)
- Auto-expiry (for guest carts)
- Discount/coupon tracking
- Real-time total calculations

---

### 5. **orders**
**Purpose:** Order history & fulfillment tracking  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // User & Reference
  userId: ObjectId,
  orderNumber: String (unique), // "ORD-2026-00001"
  
  // Items
  items: [
    {
      productId: ObjectId,
      nameSnapshot: String,
      skuSnapshot: String,
      quantity: Number,
      priceSnapshot: Decimal128,
      subtotal: Decimal128,
      discount: Decimal128,
      selectedOptions: {
        size: String,
        flavor: String,
        color: String
      }
    }
  ],
  
  // Pricing
  subtotal: Decimal128,
  taxAmount: Decimal128,
  shippingCost: Decimal128,
  discountAmount: Decimal128,
  totalAmount: Decimal128,
  
  // Addresses
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  
  // Status & Tracking
  status: String, // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  paymentStatus: String, // "pending" | "paid" | "failed" | "refunded"
  shippingStatus: String, // "pending" | "picked" | "packed" | "shipped" | "out_for_delivery" | "delivered"
  
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Payment Reference
  paymentRef: ObjectId,
  couponCode: String,
  couponDiscount: Decimal128,
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Timeline
  createdAt: Date,
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- userId (1), createdAt (-1)
- orderNumber (unique)
- status (1), createdAt (-1)
- paymentStatus (1)
- shippingStatus (1)
- createdAt (-1) // for dashboards

**Features:**
- Complete order lifecycle tracking
- Multiple status workflows
- Payment & shipping tracking
- Historical pricing snapshots
- Order timeline/audit trail
- Geolocation support
- Coupon tracking

---

### 6. **payments**
**Purpose:** Payment processing & reconciliation  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Reference
  orderId: ObjectId,
  userId: ObjectId,
  
  // Payment Details
  provider: String, // "stripe" | "paypal" | "razorpay" | "square"
  transactionId: String (indexed),
  providerPaymentId: String (indexed, unique),
  
  // Amount
  amount: Decimal128,
  currency: String, // "USD", "INR", etc
  
  // Status
  status: String, // "pending" | "processing" | "success" | "failed" | "cancelled" | "refunded"
  failureReason: String,
  
  // Refund Info
  refundId: String,
  refundAmount: Decimal128,
  refundStatus: String, // "none" | "partial" | "full"
  refundDate: Date,
  
  // Webhook
  webhookReceived: Boolean,
  rawResponse: Object, // full provider response (for debugging)
  
  // Metadata
  paymentMethod: String, // "card" | "wallet" | "bank_transfer"
  cardLast4: String, // if card payment
  cardBrand: String, // "visa" | "mastercard" etc
  
  // Timestamps
  createdAt: Date,
  processedAt: Date,
  updatedAt: Date,
  
  // Idempotency
  idempotencyKey: String (unique, indexed)
}
```
**Indexes:**
- orderId (1)
- userId (1)
- transactionId (unique)
- providerPaymentId (unique)
- status (1), createdAt (-1)
- idempotencyKey (unique)
- createdAt (-1)

**Features:**
- Multi-provider payment support
- Idempotency for webhook safety
- Refund tracking
- Payment reconciliation
- Failed payment retry support
- Webhook integration

---

### 7. **inventory_movements**
**Purpose:** Stock audit trail & reconciliation  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Product Reference
  productId: ObjectId,
  sku: String,
  
  // Movement
  movementType: String, // "purchase" | "sale" | "return" | "damage" | "adjustment" | "restock"
  quantity: Number, // positive or negative
  quantityBefore: Number,
  quantityAfter: Number,
  
  // Source Reference
  sourceRef: {
    type: String, // "order" | "return" | "manual" | "supplier"
    id: ObjectId
  },
  
  // User & Notes
  userId: ObjectId, // who made the change
  notes: String,
  reason: String,
  
  // Timestamps
  createdAt: Date
}
```
**Indexes:**
- productId (1), createdAt (-1)
- sourceRef.type (1), sourceRef.id (1)
- createdAt (-1)

**Features:**
- Complete inventory audit trail
- Movement type categorization
- Before/after snapshot
- User accountability
- Source traceability

---

### 8. **stock_alerts**
**Purpose:** Low-stock notifications & reorder alerts  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Product Reference
  productId: ObjectId,
  sku: String,
  productName: String,
  
  // Alert Details
  alertType: String, // "low_stock" | "out_of_stock" | "overstock" | "expiry_soon"
  currentStock: Number,
  threshold: Number,
  
  // Status
  status: String, // "active" | "acknowledged" | "resolved"
  acknowledgedBy: ObjectId,
  acknowledgedAt: Date,
  
  // Action
  actionTaken: String, // "reorder_initiated" | "supplier_contacted" | null
  reorderQuantity: Number,
  suggestedSupplierId: ObjectId,
  
  // Timestamps
  createdAt: Date,
  resolvedAt: Date
}
```
**Indexes:**
- productId (1)
- status (1), createdAt (-1)
- alertType (1), createdAt (-1)

**Features:**
- Multi-alert type support
- Acknowledgment tracking
- Action logging
- Supplier suggestions
- Alert resolution workflow

---

### 9. **reviews**
**Purpose:** Product ratings & customer reviews  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // References
  productId: ObjectId,
  orderId: ObjectId, // verified purchase
  userId: ObjectId,
  
  // Review Content
  rating: Number, // 1-5
  title: String,
  comment: String,
  images: [String], // URLs of review images
  
  // Review Status
  isVerified: Boolean, // verified purchase
  isApproved: Boolean, // admin approved
  isHelpful: Number, // count of helpful votes
  isUnhelpful: Number, // count of unhelpful votes
  
  // Response
  adminResponse: String,
  adminResponseAt: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- productId (1), rating (-1)
- userId (1)
- isApproved (1), createdAt (-1)
- createdAt (-1)

**Features:**
- Verified purchase reviews
- Admin moderation
- Review helpfulness voting
- Admin response capability
- Multiple images per review

---

### 10. **coupons**
**Purpose:** Discount codes & promotional campaigns  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Code Info
  code: String (unique),
  description: String,
  
  // Discount Type
  discountType: String, // "percentage" | "fixed" | "free_shipping"
  discountValue: Decimal128,
  maxDiscount: Decimal128, // cap on percentage discounts
  
  // Validity
  validFrom: Date,
  validTo: Date,
  isActive: Boolean,
  
  // Usage Limits
  maxUses: Number, // total uses
  maxUsesPerUser: Number,
  currentUses: Number,
  
  // Eligibility
  applicableCategories: [ObjectId], // empty = all categories
  applicableProducts: [ObjectId], // empty = all products
  minOrderAmount: Decimal128,
  maxOrderAmount: Decimal128,
  
  // Tracking
  createdBy: ObjectId, // admin
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- code (unique)
- isActive (1), validFrom (1), validTo (1)
- createdAt (-1)

**Features:**
- Flexible discount types
- Usage limits & caps
- Category/product targeting
- Order amount restrictions
- Admin tracking

---

### 11. **notifications**
**Purpose:** User notifications (email, SMS, push)  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Recipient
  userId: ObjectId,
  email: String,
  phone: String,
  
  // Notification Details
  type: String, // "order_placed" | "payment_received" | "shipped" | "delivered" | "review_request" | "stock_alert"
  title: String,
  message: String,
  
  // Channel
  channels: [String], // ["email", "sms", "push", "in_app"]
  
  // Reference
  relatedEntity: {
    type: String, // "order" | "product" | "review"
    id: ObjectId
  },
  
  // Status
  status: String, // "pending" | "sent" | "failed" | "read"
  sentAt: Date,
  readAt: Date,
  failureReason: String,
  retryCount: Number,
  
  // Timestamps
  createdAt: Date,
  expiresAt: Date // TTL
}
```
**Indexes:**
- userId (1), status (1)
- status (1), createdAt (-1)
- expiresAt (1) // TTL index

**Features:**
- Multi-channel notifications
- Retry mechanism
- Read tracking
- Auto-expiry
- Event-driven triggers

---

### 12. **suppliers**
**Purpose:** Supplier management & sourcing  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Basic Info
  name: String,
  email: String,
  phone: String,
  website: String,
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Contact Person
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    designation: String
  },
  
  // Products Supplied
  suppliedProducts: [ObjectId],
  
  // Terms
  paymentTerms: String,
  leadTime: Number, // in days
  minimumOrder: Decimal128,
  
  // Performance
  rating: Number, // 0-5
  isActive: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastOrderDate: Date
}
```
**Indexes:**
- name (1)
- email (unique)
- isActive (1)

**Features:**
- Multi-product sourcing
- Performance tracking
- Lead time management
- Contact management

---

### 13. **audit_logs**
**Purpose:** Admin actions & system changes  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // Action Details
  action: String, // "create" | "update" | "delete" | "login" | "price_change" | "stock_adjust"
  entityType: String, // "product" | "order" | "user" | "coupon"
  entityId: ObjectId,
  
  // User
  userId: ObjectId,
  userRole: String,
  
  // Changes
  changes: {
    fieldName: String,
    oldValue: Mixed,
    newValue: Mixed
  },
  
  // IP & Context
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: Date
}
```
**Indexes:**
- entityType (1), entityId (1)
- userId (1), createdAt (-1)
- action (1), createdAt (-1)
- createdAt (-1)

**Features:**
- Admin action tracking
- Change history
- User accountability
- Security audit trail

---

### 14. **sessions** (optional)
**Purpose:** User session management  
**Fields:**
```javascript
{
  _id: String, // sessionId
  userId: ObjectId,
  token: String, // JWT or session token
  ipAddress: String,
  userAgent: String,
  isActive: Boolean,
  createdAt: Date,
  expiresAt: Date, // TTL
  lastActivity: Date
}
```
**Indexes:**
- userId (1)
- expiresAt (1) // TTL index

**Features:**
- Multi-device session tracking
- Token management
- Activity tracking
- Auto-expiry

---

### 15. **returns**
**Purpose:** Order returns & refunds  
**Fields:**
```javascript
{
  _id: ObjectId,
  
  // References
  orderId: ObjectId,
  userId: ObjectId,
  
  // Return Items
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      reason: String,
      condition: String // "unopened" | "opened" | "damaged"
    }
  ],
  
  // Return Details
  status: String, // "requested" | "approved" | "rejected" | "shipped_back" | "received" | "refunded"
  returnReason: String,
  comments: String,
  images: [String],
  
  // Refund
  refundAmount: Decimal128,
  refundStatus: String, // "pending" | "processed" | "completed"
  refundDate: Date,
  
  // Shipping
  returnTrackingNumber: String,
  shippingLabel: String,
  
  // Timestamps
  requestedAt: Date,
  approvedAt: Date,
  receivedAt: Date,
  refundedAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- orderId (1)
- userId (1), createdAt (-1)
- status (1), createdAt (-1)

**Features:**
- Multi-item returns
- Approval workflow
- Refund tracking
- Return shipping management
- Image evidence

---

## Relationships Map

```
users (1) ──→ (many) orders
users (1) ──→ (many) carts
users (1) ──→ (many) reviews
users (1) ──→ (many) returns
users (1) ──→ (many) notifications
users (1) ──→ (many) audit_logs

products (1) ──→ (many) orders (via items)
products (1) ──→ (many) reviews
products (1) ──→ (many) inventory_movements
products (1) ──→ (many) stock_alerts
products (1) ──→ (many) carts (via items)

categories (1) ──→ (many) products

orders (1) ──→ (1) payments
orders (1) ──→ (1) returns (optional)

coupons (1) ──→ (many) orders

suppliers (1) ──→ (many) products
```

---

## Query Patterns & Aggregations

### Dashboard Queries
```javascript
// Daily Revenue
db.orders.aggregate([
  { $match: { createdAt: { $gte: ISODate("2026-05-01") }, status: "delivered" } },
  { $group: { _id: "$createdAt", revenue: { $sum: "$totalAmount" } } },
  { $sort: { _id: 1 } }
])

// Top Products
db.orders.aggregate([
  { $unwind: "$items" },
  { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" } } },
  { $sort: { qty: -1 } },
  { $limit: 10 },
  { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } }
])

// Low Stock Alert
db.products.find({ stock: { $lt: "$lowStockThreshold" }, isActive: true })
```

---

## Transactional Operations

### Order Creation (Multi-Step)
```javascript
// Should be atomic:
1. Create order document
2. Decrement product stock
3. Create payment document
4. Create inventory_movement record
5. Create notification document
```

**Use MongoDB Transactions (requires Replica Set)** to ensure atomicity.

---

## Sharding Strategy (for scale)

| Collection | Shard Key | Reason |
|-----------|-----------|---------|
| orders | { userId: "hashed" } | Distribute user orders evenly |
| products | { sku: "hashed" } | Even product distribution |
| inventory_movements | { productId: "hashed", createdAt: 1 } | Time + product isolation |
| payments | { userId: "hashed" } | User-based distribution |

---

## Backup & Replication

- **Replica Set:** 3 nodes minimum (1 primary + 2 secondaries)
- **Backup:** Daily snapshots + point-in-time recovery (PITR)
- **RTO/RPO:** < 1 hour / < 5 minutes
- **Archive:** Transactions older than 2 years → cold storage

---

## Indexes Summary

| Collection | Indexes |
|-----------|---------|
| users | email, createdAt, lastLogin |
| products | sku, slug, category, active+stock (partial), text(name,desc) |
| orders | userId+createdAt, orderNumber, status+createdAt |
| payments | orderId, transactionId, status+createdAt, idempotencyKey |
| coupons | code, isActive |
| reviews | productId+rating, userId, approvedAt |
| inventory_movements | productId+createdAt |

---

## Summary

**15 Collections:** users, products, categories, carts, orders, payments, inventory_movements, stock_alerts, reviews, coupons, notifications, suppliers, audit_logs, sessions, returns

**Key Features:**
- Full e-commerce lifecycle (browse → cart → order → payment → delivery → returns)
- Inventory management & alerts
- Multi-channel notifications
- Review & rating system
- Coupon/discount management
- Audit trail & compliance
- Session management
- Supplier tracking
