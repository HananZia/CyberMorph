'use client'

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api_helper";
import { useRouter } from "next/navigation";
import './styles.css'; // Your revised CSS will be here
import { Trash2, User, Activity, Bell, BarChart } from 'lucide-react'; // Using Lucide for modern icons

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Component to display an individual Stat box (new structure)
const StatBox = ({ icon, label, value, type = "default" }) => (
  <div className={`stat-box ${type}`}>
    <div className="stat-icon-wrapper">
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("stats"); // Default to stats for an overview
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Memoize API functions to be stable dependencies for useEffect
  const adminApi = useMemo(() => ({
    // ... (All fetch functions remain the same)
    fetchUsers: async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(Array.isArray(res) ? res : []);
      } catch (err) {
        setUsers([]);
        setError("Failed to fetch users");
        console.error(err);
      }
    },

    fetchScans: async () => {
      try {
        const res = await api.get("/admin/scans");
        setScans(Array.isArray(res) ? res : []);
      } catch (err) {
        setScans([]);
        setError("Failed to fetch scans");
        console.error(err);
      }
    },

    fetchStats: async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res || null);
      } catch (err) {
        setStats(null);
        setError("Failed to fetch stats");
        console.error(err);
      }
    },

    fetchAlerts: async () => {
      try {
        const res = await api.get("/admin/alerts");
        setAlerts(Array.isArray(res) ? res : []);
      } catch (err) {
        setAlerts([]);
        // Do not overwrite global error for a minor background fetch failure
        console.error("Failed to fetch alerts", err);
      }
    }
  }), []);

  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        adminApi.fetchUsers(),
        adminApi.fetchScans(),
        adminApi.fetchStats(),
        adminApi.fetchAlerts()
      ]);
      setIsLoading(false);
    };

    load();
    // Fetch alerts every 5 seconds (5000ms)
    const interval = setInterval(adminApi.fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [user, router, adminApi]);

  async function deleteUser(id) {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.del(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  }

  async function deleteScan(id) {
    if (!confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await api.del(`/admin/scans/${id}`);
      setScans(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  }

  if (isLoading) return <div className="loading-state">Loading Admin Data...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="admin-page-wrapper"> {/* New wrapper for background */}
      <div className="admin-console">
        <h1 className="main-title">🛡️ Cyber Project Admin Panel</h1>

        <div className="tab-navigation">
          <button className={tab === "stats" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("stats")}>
            <BarChart size={18} className="icon-left"/> System Stats
          </button>
          <button className={tab === "users" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("users")}>
            <User size={18} className="icon-left"/> Users ({users.length})
          </button>
          <button className={tab === "scans" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("scans")}>
            <Activity size={18} className="icon-left"/> Scans
          </button>
          <button className={tab === "alerts" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("alerts")}>
            <Bell size={18} className="icon-left"/> Alerts ({alerts.length})
          </button>
        </div>

        <div className="tab-content">
          
          {/* STATS OVERVIEW TAB (Default/First view) */}
          {tab === "stats" && (
            <div className="tab-section stats-grid-layout">
              <h3 className="card-title">System Overview</h3>
              {stats ? (
                <div className="stats-grid">
                  <StatBox 
                    icon={<Activity />} 
                    label="Total Scans" 
                    value={stats.total_scans ?? 0} 
                    type="primary"
                  />
                  <StatBox 
                    icon={<Bell />} 
                    label="Threats Detected" 
                    value={stats.threats ?? 0} 
                    type="danger"
                  />
                  <StatBox 
                    icon={<User />} 
                    label="Total Users" 
                    value={stats.users ?? 0} 
                    type="success"
                  />
                </div>
              ) : <p className="no-data-msg">No system statistics available.</p>}
              
              {/* Placeholder for future charts */}
              <div className="charts-container">
                <div className="card chart-placeholder-card">
                  <h3 className="card-title-mini">Daily Scan Volume</h3>
                  <div className="chart-placeholder-box">
                    <BarChart size={36} className="chart-icon"/>
                    <span className="chart-label">Chart Integration Pending</span>
                    <span className="chart-description">Placeholder for future data visualization.</span>
                  </div>
                </div>
                <div className="card chart-placeholder-card">
                  <h3 className="card-title-mini">User Activity by Role</h3>
                  <div className="chart-placeholder-box">
                    <User size={36} className="chart-icon"/>
                    <span className="chart-label">Chart Integration Pending</span>
                    <span className="chart-description">Placeholder for future data visualization.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === "users" && (
            <div className="card tab-section table-container">
              <h3 className="card-title">All Registered Users ({users.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th className="th-id">ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && <tr><td colSpan="5" className="empty-row">No users found</td></tr>}
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="data-id">{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase()}`}>{u.role}</span>
                      </td>
                      <td>
                        <button className="btn-delete" onClick={() => deleteUser(u.id)} title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SCANS TAB */}
          {tab === "scans" && (
            <div className="card tab-section scan-list">
              <h3 className="card-title">All Scan Records ({scans.length})</h3>
              {scans.length === 0 && <p className="no-data-msg">No scans recorded yet.</p>}
              {scans.map(s => (
                <div key={s.id} className="scan-item">
                  <div className="scan-details">
                    <strong>{s.filename}</strong>
                    <span className="scan-info-row">
                      <span className={`verdict-badge ${s.verdict?.toLowerCase()}`}>{s.verdict}</span>
                      <span className="data-score">Score: {s.score ?? "N/A"}</span>
                      <span className="scan-date">Scanned: {formatDate(s.timestamp)}</span>
                    </span>
                  </div>
                  <button className="btn-delete" onClick={() => deleteScan(s.id)} title="Delete Scan Record">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ALERTS TAB */}
          {tab === "alerts" && (
            <div className="card tab-section alert-list">
              <h3 className="card-title">🚨 Real-time Alerts ({alerts.length})</h3>
              {alerts.length === 0 && <p className="no-data-msg">No new alerts.</p>}
              {alerts.map((a, i) => (
                <div key={i} className="alert-item">
                  <div className="alert-icon-wrapper"><Bell size={20} /></div>
                  <div className="alert-details">
                    <strong>{a.filename}</strong>
                    <span className="alert-info-row">
                      <span className={`verdict-badge ${a.status?.toLowerCase() || "unknown"}`}>{a.status || "Unknown"}</span>
                      <span className="data-prob">Threat Probability: {Number(a.prob ?? 0).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}