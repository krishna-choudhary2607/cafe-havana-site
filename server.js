import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import db from './db.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// In-memory sessions store
const activeSessions = new Map(); // token -> { username, role }

// ─── Email Helper (Brevo HTTP API — no domain needed, 300/day free) ──────────
async function sendEmail(to, subject, html) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'krishna26072006@gmail.com';
  console.log('[Email] BREVO_API_KEY present:', !!apiKey, '| To:', to);
  if (!apiKey) {
    console.log('[Email] No Brevo API key set. Email skipped.');
    return { success: false, reason: 'No API key' };
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Cafe Havana Jaipur', email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('[Email] Failed:', JSON.stringify(data));
      return { success: false, error: data };
    }
    console.log('[Email] Sent to', to, '| MessageId:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('[Email] Exception:', err.message);
    return { success: false, error: err.message };
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

// Authentication Middlewares
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  const session = activeSessions.get(token);
  if (session) {
    req.user = session;
    next();
  } else {
    // Fallback: Check if password match master admin pwd directly (for backwards compatibility if any frontend route misses session)
    const adminPwd = process.env.ADMIN_PASSWORD || 'krishna123';
    if (token === adminPwd) {
      req.user = { username: 'admin', role: 'admin' };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
};

const superAdminAuth = (req, res, next) => {
  adminAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Requires Admin privileges' });
    }
  });
};

// Test email endpoint (admin only)
app.get('/api/test-email', adminAuth, async (req, res) => {
  const to = req.query.email;
  if (!to) return res.status(400).json({ error: 'Provide ?email=your@email.com' });
  const result = await sendEmail(
    to,
    'Test Email from Cafe Havana',
    '<h2>It works!</h2><p>Email notifications from Cafe Havana are set up correctly.</p>'
  );
  res.json(result);
});

// Dynamic Table Tokens Storage
const tokensFilePath = path.join(__dirname, 'table_tokens.json');

function loadTableTokens() {
  if (fs.existsSync(tokensFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'));
    } catch (err) {
      console.error('Error reading tokens file, resetting to default', err);
    }
  }
  const initialTokens = {};
  for (let i = 1; i <= 30; i++) {
    initialTokens[i] = crypto.randomBytes(4).toString('hex');
  }
  fs.writeFileSync(tokensFilePath, JSON.stringify(initialTokens, null, 2));
  return initialTokens;
}

let tableTokens = loadTableTokens();

// Ensure CSV file exists for backup history
const csvFilePath = path.join(__dirname, 'orders_history.csv');
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Order ID,Date,Time,Table,Items,Total,Status\n');
}
const formatCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;

// Admin Auth endpoints
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Backwards compatibility: If no username is provided, default to master 'admin'
  const targetUsername = username || 'admin';

  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [targetUsername]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = crypto.randomBytes(16).toString('hex');
      activeSessions.set(token, { username: user.username, role: user.role });
      res.json({ success: true, token, role: user.role, username: user.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Staff Management APIs (Super Admin Only)
app.get('/api/admin/users', superAdminAuth, async (req, res) => {
  try {
    const users = await db.query('SELECT id, username, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', superAdminAuth, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role || 'staff']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/admin/users/:username', superAdminAuth, async (req, res) => {
  const { username } = req.params;
  if (username === 'admin') {
    return res.status(400).json({ error: 'Cannot delete master admin' });
  }
  try {
    await db.run('DELETE FROM users WHERE username = ?', [username]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Stats endpoint (Admin & Staff)
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const orderCountRow = await db.get('SELECT COUNT(*) as count FROM orders');
    const pendingCountRow = await db.get('SELECT COUNT(*) as count FROM orders WHERE status != "completed"');
    const totalRevenueRow = await db.get('SELECT SUM(total) as total FROM orders');
    const reservationCountRow = await db.get('SELECT COUNT(*) as count FROM reservations');

    res.json({
      totalOrders: orderCountRow.count,
      pendingOrders: pendingCountRow.count,
      totalRevenue: totalRevenueRow.total || 0,
      totalReservations: reservationCountRow.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Config endpoints
const configFilePath = path.join(__dirname, 'cafe_config.json');
function loadConfig() {
  if (fs.existsSync(configFilePath)) {
    try { return JSON.parse(fs.readFileSync(configFilePath, 'utf8')); } catch (e) {}
  }
  return { upiId: '' };
}

app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

app.put('/api/config', adminAuth, (req, res) => {
  const config = loadConfig();
  if (req.body.upiId !== undefined) {
    config.upiId = req.body.upiId;
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  }
  res.json(config);
});

// API Routes (Orders)
app.get('/api/orders', adminAuth, async (req, res) => {
  try {
    // Return all orders from SQL database
    const orders = await db.query('SELECT * FROM orders');
    const parsedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
    res.json(parsedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/table-tokens', adminAuth, (req, res) => {
  res.json({ success: true, tokens: tableTokens });
});

app.post('/api/table-tokens/regenerate', adminAuth, (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber || !tableTokens[tableNumber]) {
    return res.status(400).json({ error: 'Invalid table number' });
  }
  tableTokens[tableNumber] = crypto.randomBytes(4).toString('hex');
  fs.writeFileSync(tokensFilePath, JSON.stringify(tableTokens, null, 2));
  res.json({ success: true, tokens: tableTokens });
});

app.post('/api/table-tokens/add', adminAuth, (req, res) => {
  let { tableNumber } = req.body;
  if (!tableNumber) {
    const existingTables = Object.keys(tableTokens).map(Number).filter(n => !isNaN(n));
    tableNumber = existingTables.length > 0 ? Math.max(...existingTables) + 1 : 1;
  }
  if (tableTokens[tableNumber]) {
    return res.status(400).json({ error: 'Table already exists' });
  }
  tableTokens[tableNumber] = crypto.randomBytes(4).toString('hex');
  fs.writeFileSync(tokensFilePath, JSON.stringify(tableTokens, null, 2));
  res.json({ success: true, tokens: tableTokens, newTableNumber: tableNumber });
});

app.post('/api/table-tokens/delete', adminAuth, (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber || !tableTokens[tableNumber]) {
    return res.status(400).json({ error: 'Invalid table number' });
  }
  delete tableTokens[tableNumber];
  fs.writeFileSync(tokensFilePath, JSON.stringify(tableTokens, null, 2));
  res.json({ success: true, tokens: tableTokens });
});

app.post('/api/orders', async (req, res) => {
  const order = req.body;
  
  // Verify Secure Table Token
  const expectedToken = tableTokens[order.tableNumber];
  if (!expectedToken || order.token !== expectedToken) {
    return res.status(403).json({ 
      error: 'Invalid or expired Table QR Token. You must scan the latest physical QR code on your table to place an order.' 
    });
  }
  
  try {
    // Insert into SQL database
    await db.run(
      'INSERT INTO orders (id, tableNumber, total, status, items, date) VALUES (?, ?, ?, ?, ?, ?)',
      [order.id, order.tableNumber, order.total, order.status || 'pending', JSON.stringify(order.items), order.date]
    );

    // Backup: Append to Excel-compatible CSV file permanently
    const itemsString = order.items.map(i => `${i.quantity}x ${i.name}`).join('; ');
    const dateObj = new Date(order.date);
    const csvRow = [
      order.id,
      dateObj.toLocaleDateString(),
      dateObj.toLocaleTimeString(),
      order.tableNumber,
      itemsString,
      order.total,
      order.status || 'pending'
    ].map(formatCSV).join(',') + '\n';
    fs.appendFileSync(csvFilePath, csvRow);

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (updated) {
      updated.items = JSON.parse(updated.items);
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/table/:tableNumber', adminAuth, async (req, res) => {
  const { tableNumber } = req.params;
  const { status } = req.body;
  
  try {
    const result = await db.run(
      'UPDATE orders SET status = ? WHERE tableNumber = ? AND status != "completed"',
      [status || 'completed', tableNumber]
    );
    if (result.changes > 0) {
      res.json({ success: true, message: `Updated ${result.changes} orders for table ${tableNumber}` });
    } else {
      res.status(404).json({ error: 'No active orders found for this table' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reservation Routes
app.get('/api/reservations', adminAuth, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const reservations = await db.query('SELECT * FROM reservations WHERE date >= ?', [todayStr]);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  const reservationNo = 'HAV-' + Math.floor(100000 + Math.random() * 900000);
  const newReservation = {
    id: crypto.randomBytes(4).toString('hex'),
    reservationNo,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    await db.run(
      `INSERT INTO reservations 
       (id, reservationNo, name, phone, email, date, time, guests, request, status, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newReservation.id,
        newReservation.reservationNo,
        newReservation.name,
        newReservation.phone,
        newReservation.email,
        newReservation.date,
        newReservation.time,
        newReservation.guests,
        newReservation.request,
        newReservation.status,
        newReservation.createdAt
      ]
    );
    res.status(201).json({ success: true, reservation: newReservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reservations/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.run('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    const reservation = await db.get('SELECT * FROM reservations WHERE id = ?', [id]);

    if (reservation) {
      // Send email notification to the customer
      const email = reservation.email;
      if (email && (status === 'approved' || status === 'rejected')) {
        const isApproved = status === 'approved';
        const subject = isApproved
          ? '✅ Your Reservation at Cafe Havana is Confirmed!'
          : '❌ Reservation Update from Cafe Havana';

        const html = isApproved ? `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e0d5c5;border-radius:12px;overflow:hidden">
            <div style="background:#1A1510;padding:32px;text-align:center">
              <h1 style="color:#C9963F;font-family:Georgia,serif;margin:0">Cafe Havana</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:3px;margin:4px 0 0">JAIPUR</p>
            </div>
            <div style="padding:40px 36px;background:#FAF7F2">
              <h2 style="color:#1A1510;font-family:Georgia,serif;margin:0 0 8px">Reservation Confirmed! 🎉</h2>
              <p style="color:#6B5E50;margin:0 0 28px">Hi <strong>${reservation.name}</strong>, your table is booked!</p>
              <div style="background:#fff;border:1px solid #e8ddd0;border-radius:8px;padding:24px;margin-bottom:28px">
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:8px 0;color:#6B5E50;font-size:14px">Reservation No.</td><td style="padding:8px 0;color:#C9963F;font-weight:700;text-align:right;font-size:16px">${reservation.reservationNo}</td></tr>
                  <tr style="border-top:1px solid #f0e8de"><td style="padding:8px 0;color:#6B5E50;font-size:14px">Date</td><td style="padding:8px 0;color:#1A1510;font-weight:600;text-align:right">${reservation.date}</td></tr>
                  <tr style="border-top:1px solid #f0e8de"><td style="padding:8px 0;color:#6B5E50;font-size:14px">Time</td><td style="padding:8px 0;color:#1A1510;font-weight:600;text-align:right">${reservation.time}</td></tr>
                  <tr style="border-top:1px solid #f0e8de"><td style="padding:8px 0;color:#6B5E50;font-size:14px">Guests</td><td style="padding:8px 0;color:#1A1510;font-weight:600;text-align:right">${reservation.guests}</td></tr>
                  ${reservation.request ? `<tr style="border-top:1px solid #f0e8de"><td style="padding:8px 0;color:#6B5E50;font-size:14px">Special Request</td><td style="padding:8px 0;color:#1A1510;text-align:right">${reservation.request}</td></tr>` : ''}
                </table>
              </div>
              <p style="color:#6B5E50;font-size:14px;margin:0 0 8px">⏰ Please arrive on time. Your table is held for <strong>30 minutes</strong> from the booking time.</p>
              <p style="color:#6B5E50;font-size:14px;margin:0">📍 NC-701, 7th Floor, Capital Highstreet Mall, Jagatpura, Jaipur</p>
            </div>
            <div style="background:#1A1510;padding:20px;text-align:center">
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0">Questions? Call us at +91 92575 65666</p>
            </div>
          </div>
        ` : `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e0d5c5;border-radius:12px;overflow:hidden">
            <div style="background:#1A1510;padding:32px;text-align:center">
              <h1 style="color:#C9963F;font-family:Georgia,serif;margin:0">Cafe Havana</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:3px;margin:4px 0 0">JAIPUR</p>
            </div>
            <div style="padding:40px 36px;background:#FAF7F2">
              <h2 style="color:#1A1510;font-family:Georgia,serif;margin:0 0 8px">Reservation Update</h2>
              <p style="color:#6B5E50;margin:0 0 8px">Hi <strong>${reservation.name}</strong>, we're sorry to inform you that reservation <strong>${reservation.reservationNo}</strong> for <strong>${reservation.date}</strong> at <strong>${reservation.time}</strong> could not be accommodated.</p>
              <p style="color:#6B5E50;margin:0 0 8px">Please call us to reschedule at a time that works for you.</p>
              <p style="color:#C9963F;font-weight:600;font-size:18px;margin:0">+91 92575 65666</p>
            </div>
            <div style="background:#1A1510;padding:20px;text-align:center">
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0">We look forward to hosting you soon — Cafe Havana Team</p>
            </div>
          </div>
        `;

        await sendEmail(email, subject, html);
      }
      res.json(reservation);
    } else {
      res.status(404).json({ error: 'Reservation not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for React Router (Single Page Application)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Database & Listen
const PORT = process.env.PORT || 5000;
db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
