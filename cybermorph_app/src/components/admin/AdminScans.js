// components/admin/AdminScans.js
import { useEffect, useState } from 'react';

export default function AdminScans({ api }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScans();
  }, []);

  async function fetchScans() {
    setLoading(true); setError('');
    try {
      // Expected backend endpoint: GET /admin/scans or GET /scans
      const res = await api.get('/admin/scans').catch(async err => {
        if (err.response && err.response.status === 404) return await api.get('/scans');
        throw err;
      });
      setScans(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load scans. Backend endpoint missing or unauthorized.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteScan(id) {
    if (!confirm('Delete this scan record?')) return;
    try {
      await api.delete(`/admin/scans/${id}`).catch(async err => {
        if (err.response && err.response.status === 404) return await api.delete(`/scans/${id}`);
        throw err;
      });
      setScans(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete scan');
    }
  }

  if (loading) return <div className="card">Loading scans...</div>;
  if (error) return <div className="card" style={{ color: 'crimson' }}>{error}</div>;

  return (
    <div className="card">
      <h3>Scan Logs</h3>
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Id</th><th>User</th><th>Filename</th><th>Verdict</th><th>Score</th><th>When</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {scans.length === 0 && <tr><td colSpan="7">No scans found</td></tr>}
          {scans.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.user?.username || s.user_id || '-'}</td>
              <td>{s.filename}</td>
              <td>{s.verdict}</td>
              <td>{s.score}</td>
              <td>{new Date(s.created_at || s.createdAt || s.timestamp).toLocaleString?.() || '-'}</td>
              <td>
                <button onClick={() => deleteScan(s.id)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
