'use client'
import { useState, useCallback } from "react";
import { api } from "../../lib/api_helper";
import './scan.css';
import { Activity } from 'lucide-react';
import { UploadCloud, CheckCircle, AlertTriangle, File, XCircle, Loader } from 'lucide-react'; // Modern Icons

const ProcessingSpinner = () => (
    <div className="processing-spinner">
        <Loader size={36} className="spinner-icon" />
        <p>Analyzing Threat Signature...</p>
        <p className="sub-text">This may take a moment while the file is processed by our detection engine.</p>
    </div>
);

export default function ScanPage() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = useCallback(async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);
        if (!file) { setError("Please select a file to upload."); return; }

        const form = new FormData();
        form.append("file", file);

        setLoading(true);
        try {
            const res = await api.postForm("/file_scan/upload", form)
                .catch(async err => {
                    // Fallback logic check - better to throw the error if the fallback also fails
                    if (err.status === 404) return await api.postForm("/scan/upload", form);
                    throw err;
                });

            setResult(res);
        } catch (err) {
            setError(err?.data?.detail || err.message || "File scan failed. Check the file size and type.");
            console.error(err);
        } finally {
            setLoading(false);
            setFile(null); // Clear file input state after upload attempt
        }
    }, [file]);

    const verdict = result?.verdict || result?.Verdicts?.[0] || 'PROCESSING';
    const score = (result?.score ?? result?.malware_probability ?? 'N/A'); // Format score to 4 decimal places
    const isMalicious = verdict.toLowerCase().includes('malicious') || verdict.toLowerCase().includes('threat') || parseFloat(score) > 0.5;
    const isClean = verdict.toLowerCase().includes('clean') || verdict.toLowerCase().includes('safe');
    
    // Sanitize verdict for use as a CSS class name
    let verdictClass;
    if (isMalicious) {
        verdictClass = 'malicious';
    } else if (isClean) {
        verdictClass = 'clean';
    } else {
        verdictClass = 'unknown'; // For PROCESSING or UNKNOWN status
    }
    
    // Determine header icon
    const HeaderIcon = isMalicious ? AlertTriangle : isClean ? CheckCircle : File;

    return (
        <div className="scan-page-wrapper">
            <div className="scan-card card">
                <h1 className="scan-title">
                    <UploadCloud size={32} className="title-icon" />
                    Secure File Analyzer
                </h1>
                <p className="scan-subtitle">
                    Upload a file below to initiate the threat analysis process.
                </p>

                <form onSubmit={handleUpload} className="upload-form">
                    <div className="file-input-group">
                        <label htmlFor="file-upload" className="file-label">
                            {file ? <File size={20} className="file-icon" /> : <UploadCloud size={20} className="file-icon" />}
                            <span className="file-text">
                                {file ? `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : "Drag & Drop or Click to Select File"}
                            </span>
                        </label>
                        <input 
                            id="file-upload"
                            type="file" 
                            onChange={e => setFile(e.target.files?.[0] ?? null)} 
                            className="hidden-file-input"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary btn-scan" 
                        disabled={loading || !file}
                    >
                        {loading ? "Scanning..." : <><Activity size={20} /> Initiate Scan</>}
                    </button>
                </form>

                {error && <div className="error-message"><XCircle size={20} /> {error}</div>}

                {loading && <ProcessingSpinner />}

                {result && (
                    <div className={`result-box ${verdictClass}`}>
                        <h3 className="result-header">
                            <HeaderIcon size={24} />
                            Scan Analysis Complete
                        </h3>
                        <div className="result-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">File Name</span>
                                <span className="detail-value">{result.filename || 'N/A'}</span>
                            </div>
                            <div className="detail-item verdict-item">
                                <span className="detail-label">Verdict</span>
                                <span className={`detail-value verdict-text ${verdictClass}`}>{verdict}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Threat Score</span>
                                <span className="detail-value">{score}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Time Stamp</span>
                                <span className="detail-value">{result.timestamp || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div className="raw-output-container">
                            <p className="raw-output-title">Raw Engine Output</p>
                            <pre className="raw-output">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}