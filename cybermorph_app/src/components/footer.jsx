import React from 'react';
import './footer.css'; // Dedicated CSS file for footer styles

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Brand/Logo Section (optional, but adds professionalism) */}
        <div className="footer-brand">
          CyberShield Pro
        </div>
        
        <div className="footer-links-wrapper">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Contact Support</a>
        </div>
        
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} CyberShield Pro
        </div>
      </div>
    </footer>
  );
}