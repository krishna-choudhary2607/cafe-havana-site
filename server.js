import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.post('/api/orders', (req, res) => {
  checkDateReset();
  const order = req.body;
  
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
    // We don't necessarily update the CSV line here as it's an append-only log,
    // but the dashboard state is updated perfectly.
    res.json(activeOrders[orderIndex]);
  } else {
    res.status(404).json({ error: 'Order not found' });
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
