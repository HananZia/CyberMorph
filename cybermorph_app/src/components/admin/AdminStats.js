// components/admin/AdminStats.js
import { useEffect, useState } from 'react';

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
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="card">Loading stats...</div>;
  if (!stats) return <div className="card">No stats available (implement /admin/stats)</div>;

  return (
    <div className="card">
      <h3>System Stats</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <strong>Total scans</strong>
          <p>{stats.total_scans ?? stats.total ?? '-'}</p>
        </div>
        <div style={{ flex: 1 }}>
          <strong>Threats detected</strong>
          <p>{stats.threats ?? '-'}</p>
        </div>
        <div style={{ flex: 1 }}>
          <strong>Users</strong>
          <p>{stats.users ?? '-'}</p>
        </div>
      </div>
    </div>
  );
}
