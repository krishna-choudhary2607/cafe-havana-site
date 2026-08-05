import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, MapPin, Phone } from 'lucide-react';
import './Reservation.css';

const Reservation = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', date: '', time: '', guests: '2', request: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getLocalDateString = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '2', request: '' });
        }, 5000);
      }
    } catch (err) {
      alert('Failed to submit reservation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getEndTime = () => {
    if (!formData.time) return '';
    const [h, m] = formData.time.split(':').map(Number);
    const d = new Date(); d.setHours(h); d.setMinutes(m + 30);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <section className="reservation-section" id="reservation">
      <div className="reservation-bg" />
      <div className="reservation-overlay" />

      <div className="container reservation-inner">
        {/* Left Info */}
        <motion.div
          className="reservation-info"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-subtitle">Reserve Your Spot</span>
          <h2 className="section-title res-title">Book a<br /><em>Table</em></h2>
          <div className="gold-line" style={{ marginBottom: 28 }} />

          <p className="res-info-body">
            Secure your place under the rooftop skies of Jaipur. For parties larger than 8
            or special events, reach us directly.
          </p>

          <div className="res-details">
            <div className="res-detail-row">
              <Clock size={16} className="res-icon" />
              <div>
                <strong>Opening Hours</strong>
                <span>Mon – Sun: 9:00 AM – 11:30 PM</span>
              </div>
            </div>
            <div className="res-detail-row">
              <Phone size={16} className="res-icon" />
              <div>
                <strong>Reservations & Events</strong>
                <span>+91 92575 65666</span>
              </div>
            </div>
            <div className="res-detail-row">
              <MapPin size={16} className="res-icon" />
              <div>
                <strong>Location</strong>
                <span>7th Floor, Capital Highstreet Mall, Jagatpura, Jaipur</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Form */}
        <motion.div
          className="reservation-form-wrap"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {isSubmitted ? (
            <motion.div
              className="success-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <div className="success-icon">✓</div>
              <h3>Table Reserved!</h3>
              <p>We look forward to hosting you, <strong>{formData.name}</strong>.</p>
              <p className="success-note">
                Your reservation is valid from <strong>{formData.time}</strong> until <strong>{getEndTime()}</strong>.
                After this 30-minute window, the table may be released.
              </p>
            </motion.div>
          ) : (
            <form className="reservation-form" onSubmit={handleSubmit}>
              <h3 className="form-title">Make a Reservation</h3>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit number"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row-3">
                <div className="form-group form-group-icon">
                  <label>Date</label>
                  <Calendar size={16} className="field-icon" />
                  <input
                    type="date"
                    name="date"
                    required
                    min={getLocalDateString()}
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group form-group-icon">
                  <label>Time</label>
                  <Clock size={16} className="field-icon" />
                  <input
                    type="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group form-group-icon">
                  <label>Guests</label>
                  <Users size={16} className="field-icon" />
                  <select name="guests" value={formData.guests} onChange={handleChange}>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Special Requests <span className="optional">(Optional)</span></label>
                <textarea
                  name="request"
                  placeholder="Allergies, celebrations, seating preferences..."
                  rows="3"
                  value={formData.request}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-primary res-submit-btn" disabled={isLoading}>
                {isLoading ? 'Reserving...' : 'Reserve My Table'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Reservation;
