import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import About from './components/About';
import DeconstructedDish from './components/DeconstructedDish';
import Menu from './components/Menu';
import Reservation from './components/Reservation';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPortal from './components/Admin/AdminPortal';
import OrderPage from './components/OrderPage';
import SmoothScroll from './components/SmoothScroll';
import CustomCursor from './components/CustomCursor';

function CafeSite() {
  return (
    <div className="app">
      <Navbar cartCount={0} onCartClick={() => {}} />
      
      <main>
        <HeroSection />
        <About />
        <DeconstructedDish />
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
      <SmoothScroll>
        <CustomCursor />
        <Router>
          <Routes>
            <Route path="/" element={<CafeSite />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </Router>
      </SmoothScroll>
    </ErrorBoundary>
  );
}

export default App;
