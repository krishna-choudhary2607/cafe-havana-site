import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import './Cart.css';

const Cart = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="cart-header">
              <h3>Your Order</h3>
              <button className="close-btn" onClick={onClose}><X size={24} /></button>
            </div>

            <div className="cart-body">
              {items.length === 0 ? (
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

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <button className="btn-primary checkout-btn" onClick={() => {
                  alert('Checkout simulated! In a real app, this would integrate with a payment gateway.');
                  onClose();
                }}>
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
