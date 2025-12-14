'use client'

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api_helper";
import { useRouter } from "next/navigation";
import './styles.css';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const adminApi = useMemo(() => ({
    fetchUsers: async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setUsers([]);
        setError("Failed to fetch users");
        console.error(err);
      }
    },

    fetchScans: async () => {
      try {
        const res = await api.get("/admin/scans");
        setScans(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setScans([]);
        setError("Failed to fetch scans");
        console.error(err);
      }
    },

    fetchStats: async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data || null);
      } catch (err) {
        setStats(null);
        setError("Failed to fetch stats");
        console.error(err);
      }
    },

    fetchAlerts: async () => {
      try {
        const res = await api.get("/admin/alerts");
        setAlerts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setAlerts([]);
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

    const interval = setInterval(adminApi.fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [user, router, adminApi]);

  async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
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
    <div className="admin-page">
      <div className="admin-console">
        <h1 className="main-title">🛡️ Admin Console</h1>

        <div className="tab-navigation">
          <button className={tab === "users" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("users")}>Users</button>
          <button className={tab === "scans" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("scans")}>Scans</button>
          <button className={tab === "alerts" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("alerts")}>Alerts</button>
          <button className={tab === "stats" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("stats")}>System Stats</button>
        </div>

        <div className="tab-content">

          {/* USERS */}
          {tab === "users" && (
            <div className="card">
              <h3 className="card-title">All Users ({users?.length ?? 0})</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan="5">No users found</td></tr>
                  )}
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <button className="btn-delete" onClick={() => deleteUser(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SCANS */}
          {tab === "scans" && (
            <div className="card">
              <h3 className="card-title">All Scan Records ({scans?.length ?? 0})</h3>
              {scans.length === 0 && <p>No scans recorded</p>}
              {scans.map(s => (
                <div key={s.id} className="scan-item">
                  <strong>{s.filename}</strong>
                  <span className={`verdict-badge ${s.verdict?.toLowerCase()}`}>
                    {s.verdict}
                  </span>
                  <span>Score: {s.score ?? "N/A"}</span>
                  <button className="btn-delete" onClick={() => deleteScan(s.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {/* ALERTS */}
          {tab === "alerts" && (
            <div className="card">
              <h3 className="card-title">🚨 Alerts ({alerts?.length ?? 0})</h3>
              {alerts.length === 0 && <p>No alerts</p>}
              {alerts.map((a, i) => (
                <div key={i} className="alert-item">
                  <strong>{a.filename}</strong>
                  <span className={`verdict-badge ${a.status?.toLowerCase()}`}>
                    {a.status}
                  </span>
                  <span>Probability: {Number(a.prob).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* STATS */}
          {tab === "stats" && (
            <div className="card">
              <h3 className="card-title">📊 System Stats</h3>
              {stats ? (
                <ul>
                  <li>Total scans: {stats.total_scans ?? 0}</li>
                  <li>Threats detected: {stats.threats ?? 0}</li>
                  <li>Total users: {stats.users ?? 0}</li>
                </ul>
              ) : (
                <p>No stats available</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
