'use client'
import './home.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, TrendingUp, Zap, LogIn, UserPlus } from 'lucide-react'; // Modern Icons

// Helper component for small features/info boxes
const InfoBox = ({ title, description, icon: Icon }) => (
    <div className="info-box">
        <Icon size={24} className="info-icon" />
        <h4 className="info-title">{title}</h4>
        <p className="info-description">{description}</p>
    </div>
);

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="homepage-wrapper">
      <div className="homepage-grid-container">
        
        {/* === LEFT: MAIN CALL TO ACTION (CTA) CARD === */}
        <div className="main-cta-panel">
            <div className="main-cta-card card">
                <Shield size={64} className="brand-icon" />
                <h1 className="main-heading">CyberMorph</h1>
                <p className="sub-heading">
                    **AI-Powered Threat Detection:** Rapidly analyze files with high-fidelity PE (Portable Executable) file signature analysis.
                </p>

                <div className="action-buttons-wrapper">
                    <Link href="/login" className="btn-primary-action btn-cta">
                    <LogIn size={20}/> Login to Dashboard
                    </Link>
                    <Link href="/signup" className="btn-secondary-action btn-cta">
                    <UserPlus size={20}/> Create Account
                    </Link>
                </div>
            </div>
            
            {/* Feature Highlights */}
            <div className="feature-highlights-grid">
                <InfoBox
                    title="High-Speed Analysis"
                    description="Leveraging optimized engines for near real-time detection."
                    icon={Zap}
                />
                <InfoBox
                    title="Behavioral Scoring"
                    description="Advanced scoring models based on static and dynamic attributes."
                    icon={TrendingUp}
                />
            </div>
        </div>

        {/* === RIGHT: PE FILE VISUALIZATION / THEMATIC DESIGN === */}
        <div className="visual-panel pe-file-design">
            <h3 className="design-title">PE File Structure Analysis</h3>
            <div className="pe-box pe-dos-header">
                <span className="pe-label">DOS HEADER</span>
                <span className="pe-detail">Magic: MZ</span>
                <span className="pe-offset">Offset: 0x0000</span>
            </div>
            <div className="pe-box pe-nt-header">
                <span className="pe-label">NT HEADER</span>
                <span className="pe-detail">Signature: PE\0\0</span>
            </div>
            <div className="pe-box pe-section-header">
                <span className="pe-label">SECTION HEADERS</span>
                <div className="section-list">
                    <span className="section-item">.text (Code)</span>
                    <span className="section-item">.data (Variables)</span>
                    <span className="section-item">.rdata (Read-Only)</span>
                </div>
            </div>
            <div className="pe-box pe-data-section">
                <span className="pe-label">DATA SECTION (.rsrc, .idata)</span>
            </div>
            <div className="pe-footer">
                <span className="pe-label">ENTRY POINT</span>
            </div>
        </div>

      </div>
    </div>
  );
}