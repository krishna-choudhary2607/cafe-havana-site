import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import About from './components/About';
import Menu from './components/Menu';
import Reservation from './components/Reservation';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPortal from './components/Admin/AdminPortal';
import OrderPage from './components/OrderPage';

function CafeSite() {
  return (
    <div className="app">
      <Navbar cartCount={0} onCartClick={() => {}} />
      
      <main>
        <HeroSection />
        <About />
        <Menu />
        <Reservation />
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<CafeSite />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
