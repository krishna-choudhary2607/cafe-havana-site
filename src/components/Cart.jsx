import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './Cart.css';

const Cart = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, clearCart }) => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const token = searchParams.get('token');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!tableNumber || !token) {
      alert('Invalid Table QR Code! You must scan the physical QR code on your table to place an order.');
      return;
    }

    const order = {
      id: Date.now().toString(),
      tableNumber,
      token,
      items,
      total,
      date: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to send order to kitchen.');
        return;
      }
      
      setOrderSuccess(true);
      clearCart();
      
      setTimeout(() => {
        setOrderSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to send order to kitchen. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="cart-backdrop"
          className="cart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div key="cart-panel"
          className="cart-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
            <div className="cart-header">
              <h3>{tableNumber ? `Table ${tableNumber} Order` : 'Your Order'}</h3>
              <button className="close-btn" onClick={onClose}><X size={24} /></button>
            </div>

            <div className="cart-body">
              {orderSuccess ? (
                <div className="empty-cart">
                  <div style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3>Order Sent to Kitchen!</h3>
                  <p>Your food will arrive shortly at Table {tableNumber}.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={48} className="empty-icon" />
                  <p>Your cart is empty</p>
                  <button className="btn-outline" onClick={onClose}>Browse Menu</button>
                </div>
              ) : (
                <div className="cart-items">
                  {items.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <span className="cart-item-price">₹{item.price}</span>
                        <div className="quantity-controls">
                          <button onClick={() => onUpdateQuantity(item.id, -1)}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)}><Plus size={14} /></button>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => onRemove(item.id)}><X size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && !orderSuccess && (
              <div className="cart-footer">
                {!tableNumber && (
                  <p style={{ color: 'var(--color-accent)', fontSize: '0.8rem', marginBottom: '10px', textAlign: 'center' }}>
                    Note: Scan your table's QR code to place a dine-in order.
                  </p>
                )}
                <div className="cart-total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <button 
                  className="btn-primary checkout-btn" 
                  onClick={handlePlaceOrder}
                  style={{ opacity: tableNumber ? 1 : 0.5 }}
                >
                  {tableNumber ? `Place Order for Table ${tableNumber}` : 'Requires Table QR'}
                </button>
              </div>
            )}
          </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart;
