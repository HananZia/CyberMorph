'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api_helper";
import './dashboard.css'; 
import { Activity, AlertTriangle, Users, Monitor, LogOut } from 'lucide-react'; 

const StatBox = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`stat-box ${colorClass}`}>
        <div className="stat-icon-wrapper">
            <Icon size={20} />
        </div>
        <div className="stat-content">
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value ?? "-"}</p>
        </div>
    </div>
);

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
        if (user) {
            fetchStats();
        }
    }, [user, loading]);

    async function fetchStats() {
        try {
            let res;
            if (user.role === "admin") {
                // Admin: global stats
                res = await api.get("/user/stats");
            } else {
                // Regular user: only their stats
                res = await api.get("/user/my-stats");
            }

            // For fetch wrapper, you may not need `.data` depending on api_helper
            setStats(res);
            setError("");
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load stats");
        }
    }

    if (!user) return <div className="loading-state container">Checking session…</div>;

    // Safe values with fallback
    const totalScans = stats?.total_scans ?? stats?.total ?? "—";
    const threatsDetected = stats?.threats ?? "—";
    const totalUsers = user.role === "admin" ? (stats?.total_users ?? stats?.users ?? 0) : null;

    return (
        <div className="dashboard-page-wrapper">
            <div className="dashboard-container">
                
                <div className="header-bar">
                    <h1 className="main-title">Cyber Project Dashboard</h1>
                    <div className="header-actions">
                        <button onClick={() => router.push("/scan")} className="btn-primary">
                            New Scan
                        </button>
                        {user.role === "admin" && (
                            <button onClick={() => router.push("/admin")} className="btn-secondary">
                                Admin Console
                            </button>
                        )}
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="card stats-summary-card">
                        <h4 className="card-title">Activity Overview</h4>
                        {error && <p className="error-message">{error}</p>}

                        <div className="stats-container">
                            <StatBox
                                title={user.role === 'admin' ? "Total Scans (All Users)" : "Your Total Scans"}
                                value={totalScans}
                                icon={Activity}
                                colorClass="blue"
                            />
                            <StatBox
                                title={user.role === 'admin' ? "Global Threats" : "Threats Detected"}
                                value={threatsDetected}
                                icon={AlertTriangle}
                                colorClass="red"
                            />
                            {user.role === "admin" && (
                                <StatBox
                                    title="Total Users"
                                    value={totalUsers}
                                    icon={Users}
                                    colorClass="green"
                                />
                            )}
                            {user.role !== "admin" && (
                                <StatBox
                                    title="System Status"
                                    value="Operational"
                                    icon={Monitor} 
                                    colorClass="green"
                                />
                            )}
                        </div>
                        <p className="stat-note">Metrics updated automatically from the backend service.</p>
                    </div>

                    <div className="side-panel-grid">
                        <div className="card welcome-card">
                            <h4 className="card-title">Welcome Back, {user.username}!</h4>
                            <p className="welcome-text">Your Access Details:</p>
                            <p className="user-detail">
                                Role: <strong className={`role-badge ${user.role}`}>{user.role}</strong>
                            </p>
                        </div>
                        
                        <div className="card quick-actions-card">
                            <h4 className="card-title">Quick Actions</h4>
                            <div className="action-buttons">
                                <button onClick={() => router.push("/scan")} className="btn-primary">New File Scan</button>
                                <button onClick={() => router.push("/history")} className="btn-secondary">View Scan History</button>
                                <button onClick={logout} className="btn-logout">
                                    <LogOut size={18}/> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
