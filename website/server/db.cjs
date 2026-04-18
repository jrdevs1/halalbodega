const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'halalbodega.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== Schema Creation =====
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    stripe_session_id TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
`);

// ===== Seed Menu Items =====
const existingItems = db.prepare('SELECT COUNT(*) as count FROM menu_items').get();
if (existingItems.count === 0) {
  const insertItem = db.prepare(`
    INSERT INTO menu_items (id, name, description, price, category, image, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const menuItems = [
    // Smash Burgers
    [uuidv4(), 'The OG Smash', 'Hand-smashed halal beef patty with American cheese, onions, and bodega sauce', 12.99, 'burgers', '/burger.png', 1],
    [uuidv4(), 'Double Stack', 'Two hand-smashed patties, double cheese, and signature sauce', 15.99, 'burgers', '/burger.png', 2],

    // Loaded Fries
    [uuidv4(), 'Classic Bodega Fries', 'Golden hand-cut fries with signature spice blend', 5.99, 'fries', '/fries.png', 1],
    [uuidv4(), 'Smash Loaded Fries', 'Fries topped with smashed beef, cheese, and jalapeños', 14.99, 'fries', '/fries.png', 2],

    // Drinks
    [uuidv4(), 'Salaam Cola', 'Premium halal-certified cola', 3.49, 'drinks', '/drink.png', 1],
    [uuidv4(), 'Fresh Lemonade', 'House-made with fresh lemons and mint', 4.49, 'drinks', '/drink.png', 2],

    // Placeholder
    [uuidv4(), 'MORE ITEMS COMING SOON', 'We are constantly crafting new recipes. Stay tuned!', 0.00, 'all', '/halalbodegalogogreybg.jpg', 99],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertItem.run(...item);
    }
  });

  insertMany(menuItems);
  console.log('✅ Menu items seeded');
}

// ===== Seed Admin User =====
const existingAdmin = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
if (existingAdmin.count === 0) {
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO admin_users (id, username, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), 'admin', passwordHash, 'admin');
  console.log('✅ Admin user created (username: admin, password: admin123)');
}

module.exports = db;
