import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests, please try again later.' }
});

const adminAuth = (req, res, next) => {
  const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.body.password;
  const adminPwd = process.env.ADMIN_PASSWORD || 'krishna123';
  if (token === adminPwd) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
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

// In-memory active orders (cleared daily)
let activeOrders = [];
let currentDateString = new Date().toDateString();

// Helper to check and reset orders if the day changes
function checkDateReset() {
  const todayString = new Date().toDateString();
  if (todayString !== currentDateString) {
    activeOrders = []; // Clear the dashboard
    currentDateString = todayString;
    console.log(`[System] Date changed to ${todayString}. Cleared active orders dashboard.`);
  }
}

// Dynamic Table Tokens Storage
const tokensFilePath = path.join(__dirname, 'table_tokens.json');

// Initialize or load tokens
function loadTableTokens() {
  if (fs.existsSync(tokensFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'));
    } catch (err) {
      console.error('Error reading tokens file, resetting to default', err);
    }
  }
  // Generate default random tokens for 30 tables
  const initialTokens = {};
  for (let i = 1; i <= 30; i++) {
    initialTokens[i] = crypto.randomBytes(4).toString('hex');
  }
  saveTableTokens(initialTokens);
  return initialTokens;
}

function saveTableTokens(tokens) {
  fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));
}

let tableTokens = loadTableTokens();

// Reservations Storage
const reservationsFilePath = path.join(__dirname, 'reservations.json');

function loadReservations() {
  if (fs.existsSync(reservationsFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(reservationsFilePath, 'utf8'));
    } catch (err) {
      console.error('Error reading reservations file, resetting to empty', err);
    }
  }
  const initialReservations = [];
  saveReservations(initialReservations);
  return initialReservations;
}

function saveReservations(reservations) {
  fs.writeFileSync(reservationsFilePath, JSON.stringify(reservations, null, 2));
}

let reservations = loadReservations();

// Ensure CSV file exists with headers
const csvFilePath = path.join(__dirname, 'orders_history.csv');
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Order ID,Date,Time,Table,Items,Total,Status\n');
}

// Helper to safely format CSV cells
const formatCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;

// Admin Auth endpoints
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPwd = process.env.ADMIN_PASSWORD || 'krishna123';
  if (password === adminPwd) {
    res.json({ success: true, token: adminPwd });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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

// API Routes
app.get('/api/orders', adminAuth, (req, res) => {
  checkDateReset();
  res.json(activeOrders);
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
  saveTableTokens(tableTokens);
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
  saveTableTokens(tableTokens);
  res.json({ success: true, tokens: tableTokens, newTableNumber: tableNumber });
});

app.post('/api/table-tokens/delete', adminAuth, (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber || !tableTokens[tableNumber]) {
    return res.status(400).json({ error: 'Invalid table number' });
  }
  delete tableTokens[tableNumber];
  saveTableTokens(tableTokens);
  res.json({ success: true, tokens: tableTokens });
});

app.post('/api/orders', (req, res) => {
  checkDateReset();
  const order = req.body;
  
  // Verify Secure Table Token
  const expectedToken = tableTokens[order.tableNumber];
  if (!expectedToken || order.token !== expectedToken) {
    return res.status(403).json({ 
      error: 'Invalid or expired Table QR Token. You must scan the latest physical QR code on your table to place an order.' 
    });
  }
  
  // Add to active dashboard memory
  activeOrders.push(order);
  
  // Append to Excel-compatible CSV file permanently
  const itemsString = order.items.map(i => `${i.quantity}x ${i.name}`).join('; ');
  const dateObj = new Date(order.date);
  const csvRow = [
    order.id,
    dateObj.toLocaleDateString(),
    dateObj.toLocaleTimeString(),
    order.tableNumber,
    itemsString,
    order.total,
    order.status
  ].map(formatCSV).join(',') + '\n';
  
  fs.appendFileSync(csvFilePath, csvRow);

  res.status(201).json({ success: true, order });
});

app.put('/api/orders/:id', adminAuth, (req, res) => {
  checkDateReset();
  const { id } = req.params;
  const { status } = req.body;
  
  const orderIndex = activeOrders.findIndex(o => o.id === id);
  if (orderIndex !== -1) {
    activeOrders[orderIndex].status = status;
    res.json(activeOrders[orderIndex]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.put('/api/orders/table/:tableNumber', adminAuth, (req, res) => {
  checkDateReset();
  const { tableNumber } = req.params;
  const { status } = req.body;
  
  let updatedCount = 0;
  
  // Mark all active orders for this table as completed
  activeOrders = activeOrders.map(order => {
    if (order.tableNumber.toString() === tableNumber.toString() && order.status !== 'completed') {
      updatedCount++;
      return { ...order, status: status || 'completed' };
    }
    return order;
  });
  
  if (updatedCount > 0) {
    res.json({ success: true, message: `Updated ${updatedCount} orders for table ${tableNumber}` });
  } else {
    res.status(404).json({ error: 'No active orders found for this table' });
  }
});

// Reservation Routes
app.get('/api/reservations', adminAuth, (req, res) => {
  // Only return today's and future reservations to prevent UI bloat
  const todayStr = new Date().toISOString().split('T')[0];
  const activeRes = reservations.filter(r => r.date >= todayStr);
  res.json(activeRes);
});

app.post('/api/reservations', (req, res) => {
  const reservationNo = 'HAV-' + Math.floor(100000 + Math.random() * 900000);
  const newReservation = {
    id: crypto.randomBytes(4).toString('hex'),
    reservationNo,
    ...req.body,
    status: 'pending', // pending, approved, rejected
    createdAt: new Date().toISOString()
  };
  reservations.push(newReservation);
  saveReservations(reservations);
  res.status(201).json({ success: true, reservation: newReservation });
});

app.put('/api/reservations/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = reservations.findIndex(r => r.id === id);

  if (index !== -1) {
    reservations[index].status = status;
    saveReservations(reservations);

    // Send email notification to the customer
    const reservation = reservations[index];
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
                <tr><td style="padding:8px 0;color:#6B5E50;font-size:14px">Reservation No.</td><td style="padding:8px 0;color:#C9963F;font-weight:700;text-align:right;font-size:16px">${reservation.reservationNo || reservation.id.toUpperCase()}</td></tr>
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
            <p style="color:#6B5E50;margin:0 0 8px">Hi <strong>${reservation.name}</strong>, we're sorry to inform you that reservation <strong>${reservation.reservationNo || reservation.id.toUpperCase()}</strong> for <strong>${reservation.date}</strong> at <strong>${reservation.time}</strong> could not be accommodated.</p>
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

    res.json(reservations[index]);
  } else {
    res.status(404).json({ error: 'Reservation not found' });
  }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for React Router (Single Page Application)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
