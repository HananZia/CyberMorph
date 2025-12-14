// components/admin/AdminLogs.js
import { useEffect, useState } from 'react';
import { Loader, ScrollText, AlertTriangle, CheckCircle, Info } from 'lucide-react'; // Import icons
import './AdminLogs.css'; // <=== NEW DEDICATED CSS IMPORT

// Helper to determine the CSS class for the log level
const getLogLevelClass = (logEntry) => {
    const message = logEntry.level || logEntry.message || JSON.stringify(logEntry);
    const lowerCaseMessage = message.toLowerCase();
    
    if (lowerCaseMessage.includes('error') || lowerCaseMessage.includes('exception')) return 'error';
    if (lowerCaseMessage.includes('warning') || lowerCaseMessage.includes('warn')) return 'warning';
    if (lowerCaseMessage.includes('success') || lowerCaseMessage.includes('info')) return 'info';
    if (lowerCaseMessage.includes('debug')) return 'debug';
    return 'default';
};

// Helper to render the log level icon
const LogLevelIcon = ({ level }) => {
    switch (level) {
        case 'error': return <AlertTriangle size={16} className="log-icon error" />;
        case 'warning': return <AlertTriangle size={16} className="log-icon warning" />;
        case 'info': return <Info size={16} className="log-icon info" />;
        case 'debug': return <CheckCircle size={16} className="log-icon debug" />;
        default: return <Info size={16} className="log-icon default" />;
    }
};

// Helper to format date
const formatTimestamp = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch {
        return dateString;
    }
};

export default function AdminLogs({ api }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchLogs(); }, []);

    async function fetchLogs() {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/logs').catch(async err => {
                if (err.response && err.response.status === 404) return await api.get('/logs');
                throw err;
            });
            const logData = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
            setLogs(logData);
        } catch (err) {
            console.error(err);
            setError('Failed to load system logs. Check API endpoint.');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="card loading-state">
            <Loader size={24} className="spinner" /> Fetching system logs...
        </div>
    );
    if (error) return (
        <div className="card error-state">
            <span className="error-icon">⚠️</span> {error}
        </div>
    );

    return (
        <div className="admin-logs-card card">
            <h3 className="card-title-mini">
                <ScrollText size={20} className="title-icon" /> System & Application Logs
            </h3>
            
            <div className="log-console-wrapper">
                {logs.length === 0 && <div className="no-logs-message">No system logs available.</div>}
                
                <div className="log-list">
                    {logs.map((l, i) => {
                        const level = getLogLevelClass(l);
                        const timestamp = l.timestamp || l.created_at || l.time;
                        const message = l.message || JSON.stringify(l);

                        return (
                            <div key={i} className={`log-entry ${level}`}>
                                <LogLevelIcon level={level} />
                                <span className="log-timestamp">{formatTimestamp(timestamp)}</span>
                                <pre className="log-message">{message}</pre>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <button onClick={fetchLogs} className="btn-refresh-logs">
                <Loader size={16} /> Refresh Logs
            </button>
        </div>
    );
}