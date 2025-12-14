'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api_helper";
import './dashboard.css'; // Import custom CSS

// Helper component for Stat boxes
const StatBox = ({ title, value, icon, colorClass }) => (
    <div className={`stat-box ${colorClass}`}>
        <div className="stat-icon">{icon}</div>
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

    // Fetch stats on user change
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
        if (user) {
            fetchStats();
        }
    }, [user, loading]);

    // Fetch stats function
    async function fetchStats() {
        try {
            let res;
            if (user.role === "admin") {
                // Admin users fetch global stats
                res = await api.get("/admin/stats");
            } else {
                // Regular users fetch user-specific stats
                res = await api.get("/user/stats");
            }
            setStats(res);
        } catch (err) {
            setError("Failed to load stats");
            console.error(err);
        }
    }

    if (!user) return <div className="loading-state container">Checking session…</div>;

    // Safe values with fallback
    const totalScans = stats ? (stats.total_scans ?? stats.total ?? "—") : "—";
    const threatsDetected = stats ? (stats.threats ?? "—") : "—";
    const totalUsers = user.role === "admin" ? (stats?.users ?? 0) : null;

    return (
        <div className="dashboard-page container">
            <div className="header-bar">
                <h1 className="main-title">User Dashboard</h1>
                <div className="header-actions">
                    <button onClick={() => router.push("/scan")} className="btn-primary">New Scan</button>
                    {user.role === "admin" && (
                        <button onClick={() => router.push("/admin")} className="btn-secondary">Admin Console</button>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Welcome Card */}
                <div className="card welcome-card">
                    <h4 className="card-title">Welcome Back!</h4>
                    <p className="welcome-text">You are logged in as:</p>
                    <p className="user-detail">User: <strong className="user-username">{user.username}</strong></p>
                    <p className="user-detail">Role: <strong className={`role-badge ${user.role}`}>{user.role}</strong></p>
                </div>

                {/* Stats Card */}
                <div className="card stats-summary-card">
                    <h4 className="card-title">Session Overview</h4>
                    {error && <p className="error-message">{error}</p>}

                    <div className="stats-container">
                        <StatBox
                            title="Total Scans"
                            value={totalScans}
                            icon="🔍"
                            colorClass="blue"
                        />
                        <StatBox
                            title="Threats Detected"
                            value={threatsDetected}
                            icon="🚨"
                            colorClass="red"
                        />
                        {user.role === "admin" && (
                            <StatBox
                                title="Total Users"
                                value={totalUsers}
                                icon="🧑‍💻"
                                colorClass="green"
                            />
                        )}
                    </div>

                    <p className="stat-note">These metrics summarize your recent activity or the system's global status.</p>
                </div>

                {/* Quick Actions Card */}
                <div className="card quick-actions-card">
                    <h4 className="card-title">Quick Access</h4>
                    <div className="action-buttons">
                        <button onClick={() => router.push("/scan")} className="btn-primary">New File Scan</button>
                        <button onClick={() => router.push("/history")} className="btn-secondary">View History</button>
                        <button onClick={logout} className="btn-logout">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
