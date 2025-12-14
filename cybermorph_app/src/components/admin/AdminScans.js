// components/admin/AdminScans.js
import { useEffect, useState } from 'react';
import { Trash2, Loader, Activity } from 'lucide-react'; // Import icons
import './AdminScans.css'; // <=== NEW DEDICATED CSS IMPORT

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
        return new Date(dateString).toLocaleString(undefined, options);
    } catch {
        return dateString;
    }
};

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
            const res = await api.get('/admin/scans').catch(async err => {
                if (err.response && err.response.status === 404) return await api.get('/scans');
                throw err;
            });
            const scanData = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
            setScans(scanData);
        } catch (err) {
            console.error(err);
            setError('Failed to load scans. Backend endpoint missing or unauthorized.');
        } finally {
            setLoading(false);
        }
    }

    async function deleteScan(id) {
        if (!confirm('Are you sure you want to delete this scan record permanently?')) return;
        try {
            await api.del(`/admin/scans/${id}`).catch(async err => {
                if (err.response && err.response.status === 404) return await api.del(`/scans/${id}`);
                throw err;
            });
            setScans(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert('Failed to delete scan');
        }
    }
    
    // Helper to determine the CSS class for the verdict badge
    const getVerdictClass = (verdict) => {
        if (!verdict) return 'unknown';
        const lowerCaseVerdict = verdict.toLowerCase();
        if (lowerCaseVerdict.includes('malicious') || lowerCaseVerdict.includes('threat')) return 'malicious';
        if (lowerCaseVerdict.includes('clean') || lowerCaseVerdict.includes('safe')) return 'clean';
        if (lowerCaseVerdict.includes('processing') || lowerCaseVerdict.includes('pending')) return 'pending';
        return 'unknown';
    };

    if (loading) return (
        <div className="card loading-state">
            <Loader size={24} className="spinner" /> Loading scan logs...
        </div>
    );
    if (error) return (
        <div className="card error-state">
            <span className="error-icon">⚠️</span> {error}
        </div>
    );

    return (
        <div className="admin-scans-card card">
            <h3 className="card-title-mini">
                <Activity size={20} className="title-icon" /> All Scan Records ({scans.length})
            </h3>
            
            <div className="table-wrapper">
                <table className="scans-table">
                    <thead>
                        <tr>
                            <th className="th-id">Id</th>
                            <th>User</th>
                            <th>Filename</th>
                            <th>Verdict</th>
                            <th className="th-score">Score</th>
                            <th className="th-date">When</th>
                            <th className="th-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scans.length === 0 && <tr><td colSpan="7" className="empty-row">No scan records found.</td></tr>}
                        {scans.map(s => (
                            <tr key={s.id}>
                                <td className="data-id">{s.id}</td>
                                <td>{s.user?.username || s.user_id || '-'}</td>
                                <td>{s.filename}</td>
                                <td>
                                    <span className={`verdict-badge ${getVerdictClass(s.verdict)}`}>
                                        {s.verdict || 'N/A'}
                                    </span>
                                </td>
                                <td className="data-score">{s.score ? parseFloat(s.score).toFixed(4) : '-'}</td>
                                <td className="data-date">
                                    {formatDate(s.created_at || s.createdAt || s.timestamp)}
                                </td>
                                <td>
                                    <button onClick={() => deleteScan(s.id)} className="btn-delete" title="Delete Scan Record">
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