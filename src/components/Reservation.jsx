import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock } from 'lucide-react';
import './Reservation.css';

const Reservation = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    request: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate booking
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', phone: '', date: '', time: '', guests: '2', request: '' });
      }, 3000);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="section reservation" id="reservation">
      <div className="container reservation-container">
        <motion.div 
          className="reservation-info"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Reserve Your Spot</h2>
          <p className="subtitle">Secure a table under the rooftop skies</p>
          <p className="info-text">
            For parties larger than 8, or special events, please contact us directly at <br/>
            <strong>+91 92575 65666</strong>
          </p>
          <div className="timing-info">
            <div className="time-block">
              <Clock size={20} className="time-icon" />
              <div>
                <h4>Opening Hours</h4>
                <p>Mon - Sun: 9:00 AM - 11:30 PM</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="reservation-form-wrapper"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {isSubmitted ? (
            <div className="success-message">
              <h3>Table Reserved!</h3>
              <p>We look forward to hosting you, {formData.name}.</p>
            </div>
          ) : (
            <form className="reservation-form glass" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <input type="tel" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group icon-input">
                  <Calendar size={18} className="input-icon" />
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} />
                </div>
                <div className="form-group icon-input">
                  <Clock size={18} className="input-icon" />
                  <input type="time" name="time" required value={formData.time} onChange={handleChange} />
                </div>
                <div className="form-group icon-input">
                  <Users size={18} className="input-icon" />
                  <select name="guests" value={formData.guests} onChange={handleChange}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <textarea name="request" placeholder="Special Requests (Optional)" rows="3" value={formData.request} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn-primary submit-btn">Book Table</button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Reservation;
