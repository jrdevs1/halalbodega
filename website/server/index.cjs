require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const xss = require('xss');
const { encode } = require('html-entities');
const Joi = require('joi');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const uuidv4 = () => crypto.randomUUID();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('./db.cjs');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'halalbodega_dev_secret';

// ===== Security Middleware =====
app.use(helmet()); // Secure HTTP headers
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for login
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: { error: 'Too many login attempts, please try again in an hour.' }
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://halalbodega.vercel.app',
    'http://localhost:5173'
  ].filter(Boolean),
  credentials: true
}));

// Webhook needs raw body, must be before express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    // Use a transaction for idempotency
    try {
      db.prepare(`
        UPDATE orders SET payment_status = 'paid', status = 'confirmed', updated_at = datetime('now')
        WHERE id = ? AND payment_status != 'paid'
      `).run(orderId);
      console.log(`✅ Order ${orderId} finalized via webhook`);
    } catch (err) {
      console.error(`❌ DB error during webhook: ${err.message}`);
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: '10kb' })); // Small limit to prevent large payload attacks

// ===== Sanitization Helper =====
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return encode(xss(input.trim()));
}

// ===== Validation Schemas =====
const orderSchema = Joi.object({
  customerName: Joi.string().required().min(2).max(100).trim(),
  customerEmail: Joi.string().email().optional().allow(null, ''),
  customerPhone: Joi.string().required().min(10).max(20).pattern(/^[\d\-\+\(\)\s]+$/),
  items: Joi.array().min(1).required(),
  notes: Joi.string().optional().allow(null, '').max(500).trim(),
});

// ===== Auth Middleware =====
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'halalbodega',
      audience: 'halalbodega-admin'
    });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Auth failed: invalid or expired session' });
  }
}

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Menu Routes =====
app.get('/api/menu', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, sort_order').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.get('/api/menu/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// ===== Order Routes =====
app.post('/api/orders', (req, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { customerName, customerEmail, customerPhone, items, notes } = value;

    // Validate and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.id);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item not found: ${item.id}` });
      }
      const quantity = Math.max(1, Math.min(20, parseInt(item.quantity) || 1));
      subtotal += menuItem.price * quantity;
      validatedItems.push({
        id: menuItem.id,
        name: sanitizeInput(menuItem.name),
        price: menuItem.price,
        quantity,
        image: menuItem.image
      });
    }

    const tax = Math.round(subtotal * 0.0975 * 100) / 100; // LA sales tax
    const total = Math.round((subtotal + tax) * 100) / 100;
    const orderId = uuidv4();

    db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, items, subtotal, tax, total, status, payment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?)
    `).run(orderId, sanitizeInput(customerName), customerEmail ? sanitizeInput(customerEmail) : null, sanitizeInput(customerPhone), JSON.stringify(validatedItems), subtotal, tax, total, notes ? sanitizeInput(notes) : null);

    res.status(201).json({
      id: orderId,
      items: validatedItems,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'unpaid'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.items = JSON.parse(order.items);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ===== Stripe Checkout =====
app.post('/api/checkout', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = JSON.parse(order.items);
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Sales Tax (9.75%)' },
        unit_amount: Math.round(order.tax * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/order?cancelled=true`,
      metadata: { orderId },
    });

    db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?').run(session.id, orderId);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ===== Admin Auth =====
app.post('/api/admin/login', loginLimiter, (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (typeof username !== 'string' || username.length > 50) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { 
        expiresIn: '8h',
        issuer: 'halalbodega',
        audience: 'halalbodega-admin'
      }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ===== Admin Order Management =====
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = db.prepare(query).all(...params);
    orders.forEach(o => { o.items = JSON.parse(o.items); });

    // Get counts
    const counts = {
      all: db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
      pending: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get().c,
      confirmed: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'confirmed'").get().c,
      preparing: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'preparing'").get().c,
      ready: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'ready'").get().c,
      delivered: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'").get().c,
      cancelled: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'cancelled'").get().c,
    };

    res.json({ orders, counts });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status === 'cancelled') {
      db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
      return res.json({ message: 'Order deleted successfully', id: req.params.id });
    }

    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    updated.items = JSON.parse(updated.items);

    res.json(updated);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayOrders = db.prepare(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE date(created_at) = ? AND payment_status = 'paid'"
    ).get(today);

    const totalOrders = db.prepare(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE payment_status = 'paid'"
    ).get();

    const activeOrders = db.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE status IN ('confirmed', 'preparing', 'ready')"
    ).get();

    res.json({
      today: { orders: todayOrders.count, revenue: todayOrders.revenue },
      total: { orders: totalOrders.count, revenue: totalOrders.revenue },
      activeOrders: activeOrders.count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ===== Admin Menu Management =====
app.put('/api/admin/menu/:id', authenticateAdmin, (req, res) => {
  try {
    const { error, value } = menuUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, price, category, available } = value;
    
    // Sanitize string inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = sanitizeInput(description);

    db.prepare(`
      UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, available = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(sanitizedName, sanitizedDescription, price, category, available ? 1 : 0, req.params.id);

    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`\n🐑 The Halal Bodega API running on port ${PORT}`);
  console.log(`   Production: https://halalbodega.onrender.com`);
  console.log(`   Health:     https://halalbodega.onrender.com/api/health\n`);
});
