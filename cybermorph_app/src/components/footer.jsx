export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container app-footer-content">
        <div className="footer-copyright">
            &copy; {new Date().getFullYear()} CyberShield Pro — AI Threat Detection Platform
        </div>
        <div className="footer-links-group">
          <a href="/privacy" className="footer-link">Privacy</a>
          <a href="/terms" className="footer-link">Terms</a>
          <a href="/contact" className="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  );
}