import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

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

// Secure Table Tokens
const SECRET_KEY = process.env.TABLE_SECRET || 'CafeHavanaSecureSecret2026';

function generateTableToken(tableNumber) {
  return crypto.createHash('md5').update(String(tableNumber) + SECRET_KEY).digest('hex').substring(0, 8);
}

// Ensure CSV file exists with headers
const csvFilePath = path.join(__dirname, 'orders_history.csv');
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Order ID,Date,Time,Table,Items,Total,Status\n');
}

// Helper to safely format CSV cells
const formatCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;

// API Routes
app.get('/api/orders', (req, res) => {
  checkDateReset();
  res.json(activeOrders);
});

app.post('/api/table-tokens', (req, res) => {
  const { password } = req.body;
  // Hardcoded simple admin auth for QR generation
  if (password !== 'krishna123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const tokens = {};
  for(let i = 1; i <= 30; i++) {
    tokens[i] = generateTableToken(i);
  }
  res.json({ success: true, tokens });
});

app.post('/api/orders', (req, res) => {
  checkDateReset();
  const order = req.body;
  
  // Verify Secure Table Token
  const expectedToken = generateTableToken(order.tableNumber);
  if (order.token !== expectedToken) {
    return res.status(403).json({ 
      error: 'Invalid or missing Table QR Token. You must scan the physical QR code on your table to place an order.' 
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

app.put('/api/orders/:id', (req, res) => {
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

app.put('/api/orders/table/:tableNumber', (req, res) => {
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
