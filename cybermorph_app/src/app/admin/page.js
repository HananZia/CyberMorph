// src/app/admin/page.jsx
'use client'
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api_helper";
import { useRouter } from "next/navigation";
import './styles.css'; // Import your custom CSS file

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const adminApi = useMemo(() => ({
    // ... (API fetch functions remain the same)
    fetchUsers: async () => { /* ... */ },
    fetchScans: async () => { /* ... */ },
    fetchStats: async () => { /* ... */ }
  }), []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        adminApi.fetchUsers(),
        adminApi.fetchScans(),
        adminApi.fetchStats(),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [user, router, adminApi]);

  async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.del(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Delete failed: Check network and permissions.");
      console.error(err);
    }
  }

  async function deleteScan(id) {
    if (!confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await api.del(`/admin/scans/${id}`);
      setScans(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Delete failed: Check network and permissions.");
      console.error(err);
    }
  }

  if (isLoading) {
    return <div className="loading-state">Loading Admin Data...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-console">
        <h1 className="main-title">🛡️ Admin Console</h1>

        <div className="tab-navigation">
          <button className={tab === "users" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("users")}>Users</button>
          <button className={tab === "scans" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("scans")}>Scans</button>
          <button className={tab === "stats" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("stats")}>System Stats</button>
        </div>

        <div className="tab-content">
          {/* USERS TAB */}
          {tab === "users" && (
            <div className="card user-list-card">
              <h3 className="card-title">All Users ({users.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && <tr><td colSpan="5" className="empty-row">No users found.</td></tr>}
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => deleteUser(u.id)} className="btn-delete">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCANS TAB */}
          {tab === "scans" && (
            <div className="card scan-list-card">
              <h3 className="card-title">All Scan Records ({scans.length})</h3>
              {scans.length === 0 && <p className="empty-state-message">No scans have been recorded yet.</p>}
              <div className="scan-list">
                {scans.map(s => (
                  <div key={s.id} className="scan-item">
                    <div className="scan-details">
                      <div className="scan-info">
                        <strong>{s.filename}</strong>
                        <span className={`verdict-badge ${s.verdict.toLowerCase()}`}>{s.verdict}</span>
                      </div>
                      <div className="scan-score">
                        Score: <span>{s.score ?? "N/A"}</span>
                      </div>
                      {s.details && (
                        <pre className="scan-pre">{s.details}</pre>
                      )}
                    </div>
                    <div className="scan-actions">
                      <button onClick={() => deleteScan(s.id)} className="btn-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {tab === "stats" && (
            <div className="card stats-card">
              <h3 className="card-title">📊 System Performance Overview</h3>
              {stats ? (
                <div className="stats-grid">
                  {/* Stat Boxes */}
                  <div className="stat-box indigo">
                    <div className="stat-icon">🔍</div>
                    <div className="stat-content">
                      <p className="stat-label">Total Scans</p>
                      <p className="stat-value">{stats.total_scans ?? 0}</p>
                    </div>
                  </div>
                  <div className="stat-box red">
                    <div className="stat-icon">🚨</div>
                    <div className="stat-content">
                      <p className="stat-label">Threats Detected</p>
                      <p className="stat-value">{stats.threats ?? 0}</p>
                    </div>
                  </div>
                  <div className="stat-box green">
                    <div className="stat-icon">🧑‍💻</div>
                    <div className="stat-content">
                      <p className="stat-label">Active Users</p>
                      <p className="stat-value">{stats.users ?? 0}</p>
                    </div>
                  </div>

                  {/* Chart Placeholders */}
                  <div className="charts-container">
                    <ChartPlaceholder title="Daily Scan Volume" description="Placeholder for a Line Chart showing scans over time." />
                    <ChartPlaceholder title="Threat vs. Clean Ratio" description="Placeholder for a Pie Chart showing verdict distribution." />
                    <ChartPlaceholder title="User Growth Over Time" description="Placeholder for a Bar Chart showing new users monthly." />
                    <ChartPlaceholder title="Threat Breakdown" description="Placeholder for a Bar Chart showing top threat types." />
                  </div>
                </div>
              ) : <p className="empty-state-message">No system statistics available.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for chart placeholders (still necessary as a React component)
const ChartPlaceholder = ({ title, description }) => (
  <div className="chart-placeholder-card">
    <h4 className="chart-title">{title}</h4>
    <div className="chart-placeholder-box">
      <div className="chart-icon">📈</div>
      <p className="chart-label">{title}</p>
      <p className="chart-description">{description}</p>
      {/* [Image of Dashboard stat cards and chart placeholders] */}
    </div>
  </div>
);