import React, { useState, useEffect } from 'react';
import './AdminPortal.css';

const AdminPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Real payment UPI ID configuration
  const [upiId, setUpiId] = useState(localStorage.getItem('cafe_upi_id') || '');
  const [isEditingUpi, setIsEditingUpi] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      const interval = setInterval(loadOrders, 5000); // refresh every 5s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const savedOrders = await res.json();
      setOrders(savedOrders.reverse()); // newest first
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'krishna' && password === 'krishna123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const saveUpiId = () => {
    localStorage.setItem('cafe_upi_id', upiId);
    setIsEditingUpi(false);
    alert('UPI ID saved for receiving payments!');
  };

  const markAsCompleted = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert('Failed to mark as completed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h2>Admin Portal</h2>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Cafe Havana</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <div className="settings-panel">
          <h3>Payment Settings</h3>
          {isEditingUpi || !upiId ? (
            <div className="upi-input-group">
              <input 
                type="text" 
                placeholder="Enter your real UPI ID" 
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
              <button onClick={saveUpiId} className="btn-primary small-btn">Save</button>
            </div>
          ) : (
            <div className="upi-display">
              <p>Active UPI: <strong>{upiId}</strong></p>
              <button onClick={() => setIsEditingUpi(true)} className="btn-outline small-btn">Edit</button>
            </div>
          )}
          <p className="settings-hint">Enter your actual UPI ID here to test real payments via the QR code!</p>
        </div>

        <ul className="order-list">
          {orders.map(order => (
            <li 
              key={order.id} 
              className={`order-item ${order.status === 'completed' ? 'completed' : 'pending'} ${selectedOrder?.id === order.id ? 'active' : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-item-header">
                <span className="table-badge">Table {order.tableNumber}</span>
                <span className="time">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="order-item-summary">
                ₹{order.total.toFixed(2)} - {order.items.length} items
              </div>
            </li>
          ))}
          {orders.length === 0 && <p className="no-orders">No orders yet.</p>}
        </ul>
      </div>

      <div className="admin-main">
        {selectedOrder ? (
          <div className="bill-container">
            <div className="bill-paper" id={`printable-bill-${selectedOrder.id}`}>
              <div className="bill-header">
                <h2>Cafe Havana</h2>
                <p>Jaipur, Rajasthan</p>
                <div className="divider"></div>
                <div className="bill-meta">
                  <p><strong>Table:</strong> {selectedOrder.tableNumber}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(selectedOrder.date).toLocaleTimeString()}</p>
                  <p><strong>Order ID:</strong> #{selectedOrder.id.slice(-6)}</p>
                </div>
                <div className="divider"></div>
              </div>
              
              <table className="bill-items">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="divider"></div>
              
              <div className="bill-total">
                <p>Subtotal: <span>₹{selectedOrder.total.toFixed(2)}</span></p>
                <p>CGST (2.5%): <span>₹{(selectedOrder.total * 0.025).toFixed(2)}</span></p>
                <p>SGST (2.5%): <span>₹{(selectedOrder.total * 0.025).toFixed(2)}</span></p>
                <h3 className="grand-total">Total: <span>₹{(selectedOrder.total * 1.05).toFixed(2)}</span></h3>
              </div>

              {upiId && (
                <div className="bill-qr-section">
                  <p>Scan to Pay via UPI</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=CafeHavana&am=${(selectedOrder.total * 1.05).toFixed(2)}`)}`} 
                    alt="Payment QR Code" 
                    className="qr-code"
                  />
                  <p className="qr-hint">Supports GPay, PhonePe, Paytm</p>
                </div>
              )}
              
              <div className="bill-footer">
                <p>Thank you for dining with us!</p>
              </div>
            </div>

            <div className="bill-actions">
              <button 
                className="btn-primary print-btn" 
                onClick={() => window.print()}
              >
                Print Bill
              </button>
              {selectedOrder.status !== 'completed' && (
                <button 
                  className="btn-outline complete-btn" 
                  onClick={() => markAsCompleted(selectedOrder.id)}
                >
                  Mark as Paid & Completed
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2>Select an order to view bill</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
