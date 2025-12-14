// components/admin/AdminStats.js
import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Users, Loader, BarChart } from 'lucide-react'; // Import icons
import './AdminStats.css'; // <=== NEW DEDICATED CSS IMPORT

// Helper component for Stat boxes (Reused from Dashboard)
const StatBox = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`stat-box ${colorClass}`}>
        <div className="stat-icon-wrapper">
            <Icon size={24} />
        </div>
        <div className="stat-content">
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value ?? "-"}</p>
        </div>
    </div>
);

export default function AdminStats({ api }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        setLoading(true);
        try {
            // Expected backend endpoint: GET /admin/stats or GET /stats
            const res = await api.get('/admin/stats').catch(async err => {
                if (err.response && err.response.status === 404) return await api.get('/stats');
                throw err;
            });
            // Handle different API response structures
            setStats(res.data || res || null); 
        } catch (err) {
            console.error("Error fetching admin stats:", err);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="admin-stats-card card loading-state">
            <Loader size={24} className="spinner" /> Loading system statistics...
        </div>
    );
    
    // Check if stats are available and non-empty
    const hasStats = stats && (stats.total_scans || stats.total || stats.threats || stats.users);

    if (!hasStats) return (
        <div className="admin-stats-card card no-stats-state">
            <BarChart size={24} className="icon-info" /> No detailed system statistics available.
        </div>
    );

    // Prepare values with fallbacks
    const totalScans = stats.total_scans ?? stats.total ?? '-';
    const threatsDetected = stats.threats ?? '-';
    const totalUsers = stats.users ?? '-';

    return (
        <div className="admin-stats-card card">
            <h3 className="card-title-mini">
                <BarChart size={20} className="title-icon" /> System Overview Metrics
            </h3>
            
            <div className="stats-grid">
                <StatBox
                    title="Total Scans Executed"
                    value={totalScans}
                    icon={Activity}
                    colorClass="primary"
                />
                <StatBox
                    title="Threats Flagged"
                    value={threatsDetected}
                    icon={AlertTriangle}
                    colorClass="danger"
                />
                <StatBox
                    title="Total Registered Users"
                    value={totalUsers}
                    icon={Users}
                    colorClass="success"
                />
                {/* Add a placeholder for a health metric */}
                <StatBox
                    title="Service Health"
                    value="Operational"
                    icon={Loader}
                    colorClass="info"
                />
            </div>
            <p className="stats-footer-note">These metrics summarize the platform's lifetime activity.</p>
        </div>
    );
}