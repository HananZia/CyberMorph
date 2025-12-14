// components/admin/AdminUsers.js
import { useEffect, useState } from 'react';
import { Trash2, Loader, User } from 'lucide-react'; // Import icons
import './AdminUsers.css'; // <=== NEW DEDICATED CSS IMPORT

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
        return new Date(dateString).toLocaleString(undefined, options);
    } catch {
        return dateString; // Fallback for invalid date strings
    }
};

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
            const res = await api.get('/admin/users').catch(async err => {
                // fallback: try /users
                if (err.response && err.response.status === 404) return await api.get('/users');
                throw err;
            });
            // Ensure data is an array, handling various backend response formats
            const userData = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
            setUsers(userData);
        } catch (err) {
            console.error(err);
            setError('Failed to load users. Backend endpoint not found or unauthorized.');
        } finally {
            setLoading(false);
        }
    }

    async function deleteUser(id) {
        if (!confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await api.del(`/admin/users/${id}`).catch(async err => {
                if (err.response && err.response.status === 404) return await api.del(`/users/${id}`);
                throw err;
            });
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    }

    if (loading) return (
        <div className="card loading-state">
            <Loader size={24} className="spinner" /> Loading users...
        </div>
    );
    if (error) return (
        <div className="card error-state">
            <span className="error-icon">⚠️</span> {error}
        </div>
    );

    return (
        <div className="admin-users-card card">
            <h3 className="card-title-mini">
                <User size={20} className="title-icon" /> All Platform Users ({users.length})
            </h3>
            
            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th className="th-id">Id</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th className="th-date">Created</th>
                            <th className="th-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && <tr><td colSpan="6" className="empty-row">No users found.</td></tr>}
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="data-id">{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge ${u.role?.toLowerCase()}`}>{u.role}</span>
                                </td>
                                <td className="data-date">
                                    {formatDate(u.created_at || u.createdAt || u.createdat)}
                                </td>
                                <td>
                                    <button onClick={() => deleteUser(u.id)} className="btn-delete" title="Delete User">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}