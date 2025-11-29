'use client'
import { useState, useCallback } from "react";
import { api } from "../../lib/api_helper";
import './scan.css'; // Import custom CSS

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
          // Fallback logic check
          if (err.status === 404) return await api.postForm("/scan/upload", form);
          throw err;
        });

      setResult(res);
    } catch (err) {
      setError(err?.data?.detail || err.message || "File scan failed.");
      console.error(err);
    } finally {
      setLoading(false);
      setFile(null); // Clear file input state after upload attempt
    }
  }, [file]);

  const verdict = result?.verdict || result?.Verdicts?.[0] || 'PROCESSING';
  const score = result?.score ?? result?.malware_probability ?? 'N/A';
  const isMalicious = verdict.toLowerCase().includes('malicious') || parseFloat(score) > 0.5;
  
  // Sanitize verdict for use as a CSS class name
  const verdictClass = verdict.toLowerCase().replace('/', '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="scan-page-container container">
      <div className="scan-card card">
        <h1 className="scan-title">Upload File for Scanning</h1>
        <p className="scan-subtitle">Securely analyze documents and executables for threats.</p>

        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <label htmlFor="file-upload" className="file-label">
                {file ? file.name : "Choose File..."}
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
            className="btn-scan" 
            disabled={loading || !file}
          >
            {loading ? "Analyzing Threat Signature…" : "Upload & Scan"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading && (
             <div className="loading-state">
                <div className="spinner"></div>
                <p>Scanning file: {file?.name || '...'} (Please wait)</p>
            </div>
        )}

        {result && (
          <div className={`result-box ${isMalicious ? 'malicious' : 'clean'}`}>
            <h3 className="result-header">Scan Analysis Complete</h3>
            <div className="result-details">
                <div className="detail-item">
                    <span className="detail-label">File:</span>
                    <span className="detail-value">{result.filename || file?.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Verdict:</span>
                    <span className={`verdict-text ${verdictClass}`}>{verdict}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Threat Score:</span>
                    <span className="detail-value">{score}</span>
                </div>
            </div>
            
            <pre className="raw-output">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}