import React, { useState, useEffect } from 'react';
import './AdminPortal.css';

const AdminPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [viewMode, setViewMode] = useState('orders'); // 'orders' | 'tables' | 'reservations'
  
  // Real payment UPI ID configuration
  const [upiId, setUpiId] = useState(localStorage.getItem('cafe_upi_id') || '');
  const [isEditingUpi, setIsEditingUpi] = useState(false);

  const loadData = async () => {
    try {
      const resOrders = await fetch('/api/orders');
      const savedOrders = await resOrders.json();
      setOrders(savedOrders.reverse()); // newest first
      
      const resResv = await fetch('/api/reservations');
      const savedResv = await resResv.json();
      setReservations(savedResv.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 5000); // refresh every 5s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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
      loadData();
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  const markTableAsCompleted = async (tableNumber) => {
    try {
      await fetch(`/api/orders/table/${tableNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      loadData();
      setSelectedTable(null);
    } catch (err) {
      console.error(err);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
      setSelectedReservation(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Derive active tables for the Table View
  const activeTablesMap = new Map();
  orders.filter(o => o.status !== 'completed').forEach(o => {
    if (!activeTablesMap.has(o.tableNumber)) {
      activeTablesMap.set(o.tableNumber, {
        tableNumber: o.tableNumber,
        orders: []
      });
    }
    activeTablesMap.get(o.tableNumber).orders.push(o);
  });
  const activeTables = Array.from(activeTablesMap.values());

  // Helper to generate combined bill for a table
  const getCombinedTableBill = (tableData) => {
    if (!tableData) return null;
    let combinedItems = [];
    let combinedTotal = 0;

    tableData.orders.forEach(order => {
      combinedTotal += order.total;
      order.items.forEach(item => {
        const existing = combinedItems.find(i => i.name === item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          combinedItems.push({ ...item });
        }
      });
    });

    return {
      tableNumber: tableData.tableNumber,
      items: combinedItems,
      total: combinedTotal,
      orderCount: tableData.orders.length,
      orderIds: tableData.orders.map(o => o.id.slice(-6)).join(', ')
    };
  };

  const combinedBill = selectedTable ? getCombinedTableBill(activeTablesMap.get(selectedTable)) : null;

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
          <button 
            className="btn-outline" 
            style={{ marginTop: '10px', width: '100%', fontSize: '0.8rem' }}
            onClick={() => window.open('/print-qrs.html', '_blank')}
          >
            Manage Table QR Codes
          </button>
        </div>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'orders' ? 'active' : ''}`}
            onClick={() => { setViewMode('orders'); setSelectedTable(null); setSelectedReservation(null); }}
          >
            All Orders
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'tables' ? 'active' : ''}`}
            onClick={() => { setViewMode('tables'); setSelectedOrder(null); setSelectedReservation(null); }}
          >
            Table Bills
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'reservations' ? 'active' : ''}`}
            onClick={() => { setViewMode('reservations'); setSelectedOrder(null); setSelectedTable(null); }}
          >
            Reservations
          </button>
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
        </div>

        <ul className="order-list">
          {viewMode === 'orders' ? (
            // ORDERS VIEW
            <>
              {orders.map(order => (
                <li 
                  key={order.id} 
                  className={`order-item ${order.status === 'completed' ? 'completed' : 'pending'} ${selectedOrder?.id === order.id ? 'active' : ''}`}
                  onClick={() => { setSelectedOrder(order); setSelectedTable(null); }}
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
            </>
          ) : viewMode === 'tables' ? (
            // TABLES VIEW
            <>
              {activeTables.map(table => (
                <li 
                  key={`table-${table.tableNumber}`} 
                  className={`order-item pending ${selectedTable === table.tableNumber ? 'active' : ''}`}
                  onClick={() => { setSelectedTable(table.tableNumber); setSelectedOrder(null); setSelectedReservation(null); }}
                >
                  <div className="order-item-header">
                    <span className="table-badge">Table {table.tableNumber}</span>
                    <span className="time">{table.orders.length} active orders</span>
                  </div>
                  <div className="order-item-summary">
                    Combined Bill: ₹{getCombinedTableBill(table).total.toFixed(2)}
                  </div>
                </li>
              ))}
              {activeTables.length === 0 && <p className="no-orders">No active tables.</p>}
            </>
          ) : (
            // RESERVATIONS VIEW
            <>
              {reservations.map(resv => (
                <li 
                  key={resv.id} 
                  className={`order-item ${resv.status === 'pending' ? 'pending' : 'completed'} ${selectedReservation?.id === resv.id ? 'active' : ''}`}
                  onClick={() => { setSelectedReservation(resv); setSelectedOrder(null); setSelectedTable(null); }}
                >
                  <div className="order-item-header">
                    <span className="table-badge">{resv.name}</span>
                    <span className="time">{new Date(resv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="order-item-summary">
                    {resv.date} at {resv.time} - {resv.guests} Guests
                  </div>
                  <div className={`status-text ${resv.status}`}>{resv.status.toUpperCase()}</div>
                </li>
              ))}
              {reservations.length === 0 && <p className="no-orders">No reservations yet.</p>}
            </>
          )}
        </ul>
      </div>

      <div className="admin-main">
        {viewMode === 'orders' && selectedOrder ? (
          // KITCHEN ORDER TICKET (KOT)
          <div className="kot-container">
            <div className="kot-paper" id={`printable-bill-${selectedOrder.id}`}>
              <div className="kot-header">
                <h2>Table {selectedOrder.tableNumber}</h2>
                <span className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status}</span>
              </div>
              <div className="kot-meta">
                <p><strong>Order ID:</strong> #{selectedOrder.id.slice(-6)}</p>
                <p><strong>Time:</strong> {new Date(selectedOrder.date).toLocaleTimeString()}</p>
              </div>
              <div className="divider"></div>
              
              <ul className="kot-items">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="kot-item">
                    <span className="kot-qty">{item.quantity}x</span>
                    <span className="kot-name">{item.name}</span>
                  </li>
                ))}
              </ul>

              <div className="divider"></div>
            </div>

            <div className="bill-actions">
              <button className="btn-primary print-btn" onClick={() => window.print()}>Print Ticket</button>
              {selectedOrder.status !== 'completed' && (
                <button className="btn-outline complete-btn" onClick={() => markAsCompleted(selectedOrder.id)}>
                  Mark as Prepared / Done
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'tables' && combinedBill ? (
          // COMBINED TABLE BILL
          <div className="bill-container">
            <div className="bill-paper" id={`printable-bill-table-${combinedBill.tableNumber}`}>
              <div className="bill-header">
                <h2>Cafe Havana</h2>
                <p>Jaipur, Rajasthan</p>
                <div className="divider"></div>
                <div className="bill-meta">
                  <p><strong>Table:</strong> {combinedBill.tableNumber}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Order ID(s):</strong> #{combinedBill.orderIds}</p>
                  <p><strong>Aggregated Orders:</strong> {combinedBill.orderCount}</p>
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
                  {combinedBill.items.map((item, idx) => (
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
                <p>Subtotal: <span>₹{combinedBill.total.toFixed(2)}</span></p>
                <p>CGST (2.5%): <span>₹{(combinedBill.total * 0.025).toFixed(2)}</span></p>
                <p>SGST (2.5%): <span>₹{(combinedBill.total * 0.025).toFixed(2)}</span></p>
                <h3 className="grand-total">Total: <span>₹{(combinedBill.total * 1.05).toFixed(2)}</span></h3>
              </div>

              {upiId && (
                <div className="bill-qr-section">
                  <p>Scan to Pay via UPI</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=CafeHavana&am=${(combinedBill.total * 1.05).toFixed(2)}`)}`} 
                    alt="Payment QR Code" 
                    className="qr-code"
                  />
                </div>
              )}
            </div>

            <div className="bill-actions">
              <button className="btn-primary print-btn" onClick={() => window.print()}>Print Bill</button>
              <button className="btn-outline complete-btn" onClick={() => markTableAsCompleted(combinedBill.tableNumber)}>
                Clear Table Bill
              </button>
            </div>
          </div>
        ) : viewMode === 'reservations' && selectedReservation ? (
          // RESERVATION DETAILS
          <div className="kot-container">
            <div className="kot-paper" style={{ padding: '30px' }}>
              <div className="kot-header">
                <h2>{selectedReservation.name}</h2>
                <span className={`status-badge ${selectedReservation.status}`}>{selectedReservation.status}</span>
              </div>
              <div className="kot-meta">
                <p><strong>Phone:</strong> {selectedReservation.phone}</p>
                <p><strong>Date:</strong> {selectedReservation.date}</p>
                <p><strong>Time:</strong> {selectedReservation.time}</p>
                <p><strong>Guests:</strong> {selectedReservation.guests}</p>
              </div>
              
              <div className="divider"></div>
              <div className="ingredients-box" style={{ background: 'transparent' }}>
                <h4>Special Request</h4>
                <p>{selectedReservation.request ? selectedReservation.request : <em>None provided</em>}</p>
              </div>
              
              <div className="divider"></div>
            </div>

            <div className="bill-actions">
              {selectedReservation.status === 'pending' && (
                <>
                  <button className="btn-primary" onClick={() => updateReservationStatus(selectedReservation.id, 'approved')}>Approve</button>
                  <button className="btn-outline complete-btn" onClick={() => updateReservationStatus(selectedReservation.id, 'rejected')}>Reject</button>
                </>
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
            <h2>
              {viewMode === 'orders' ? 'Select an order to view bill' : 
               viewMode === 'tables' ? 'Select a table to view combined bill' : 
               'Select a reservation to view details'}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
