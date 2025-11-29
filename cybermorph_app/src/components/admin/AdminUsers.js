// components/admin/AdminUsers.js
import { useEffect, useState } from 'react';

export default function AdminUsers({ api }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      // Expected backend endpoint: GET /admin/users or GET /users (admin-only)
      const res = await api.get('/admin/users').catch(async err => {
        // fallback: try /users
        if (err.response && err.response.status === 404) return await api.get('/users');
        throw err;
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users. Backend endpoint not found or unauthorized.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    if (!confirm('Delete user permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`).catch(async err => {
        if (err.response && err.response.status === 404) return await api.delete(`/users/${id}`);
        throw err;
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  }

  if (loading) return <div className="card">Loading users...</div>;
  if (error) return <div className="card" style={{ color: 'crimson' }}>{error}</div>;

  return (
    <div className="card">
      <h3>All Users</h3>
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Id</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && <tr><td colSpan="6">No users found</td></tr>}
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.created_at || u.createdAt || u.createdAt).toLocaleString?.() || '-'}</td>
              <td>
                <button onClick={() => deleteUser(u.id)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
