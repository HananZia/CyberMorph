// components/admin/AdminLogs.js
import { useEffect, useState } from 'react';

export default function AdminLogs({ api }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      // Expected backend endpoint: GET /admin/logs or GET /logs
      const res = await api.get('/admin/logs').catch(async err => {
        if (err.response && err.response.status === 404) return await api.get('/logs');
        throw err;
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="card">Loading logs...</div>;

  return (
    <div className="card">
      <h3>System Logs</h3>
      <div style={{ maxHeight: 360, overflow: 'auto', marginTop: 12 }}>
        {logs.length === 0 && <div>No logs available.</div>}
        {logs.map((l, i) => (
          <div key={i} style={{ padding: 8, borderBottom: '1px solid #222' }}>
            <div style={{ fontSize: 12, color: '#9aa' }}>{l.timestamp || l.created_at || l.time}</div>
            <div style={{ fontSize: 14 }}>{l.message || JSON.stringify(l)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
