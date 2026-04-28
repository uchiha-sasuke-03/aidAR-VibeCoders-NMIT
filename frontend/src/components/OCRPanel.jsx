import { useState, useCallback } from 'react';
import { ScanLine, Upload, FileText, Zap } from 'lucide-react';
import { ocrExtract, ocrDemo } from '../services/api';

export default function OCRPanel() {
  const [rawText, setRawText] = useState('');
  const [structured, setStructured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setRawText('');
    setStructured(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const res = await ocrExtract(base64);
        setRawText(res.raw_text);
        setStructured(res.structured_data);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ocrDemo();
      setRawText(res.raw_text);
      setStructured(res.structured_data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>OCR Report Scanner</h2>
        <p>Upload a paper medical report image. Tesseract reads it, and GPT structures the data into your digital twin.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><ScanLine size={18} /> Upload Medical Report</div>
          <button className="btn btn-secondary" onClick={handleDemo} disabled={loading}>
            <Zap size={14} /> Run Demo (No Image)
          </button>
        </div>

        <label className="ocr-dropzone" htmlFor="ocr-file-input">
          <Upload size={40} />
          <p><strong>Click to upload</strong> or drag an image of a medical report</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG, TIFF supported</p>
          <input
            id="ocr-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </label>

        {error && (
          <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-spinner" style={{ marginTop: 24 }}><div className="spinner"></div></div>
      )}

      {(rawText || structured) && !loading && (
        <div className="ocr-result-grid fade-in" style={{ marginTop: 24 }}>
          {/* Raw OCR Text */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><FileText size={18} /> Raw OCR Output</div>
            </div>
            <pre style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 16,
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              maxHeight: 400,
              overflow: 'auto',
            }}>
              {rawText}
            </pre>
          </div>

          {/* Structured Data */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Zap size={18} /> AI-Structured Data (GPT)</div>
            </div>
            {structured && !structured.error ? (
              <div>
                {structured.patient_name && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="stat-label">Patient Name</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{structured.patient_name}</div>
                  </div>
                )}

                {structured.vitals && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="stat-label" style={{ marginBottom: 8 }}>Extracted Vitals</div>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      {Object.entries(structured.vitals).filter(([, v]) => v != null).map(([key, val]) => (
                        <div key={key} className="stat-tile blue" style={{ padding: 12 }}>
                          <div className="stat-label" style={{ fontSize: '0.65rem' }}>{key.replace(/_/g, ' ')}</div>
                          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {structured.diagnosis?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="stat-label" style={{ marginBottom: 8 }}>Diagnosis</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {structured.diagnosis.map((d, i) => (
                        <span key={i} className="badge orange">{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {structured.medications?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="stat-label" style={{ marginBottom: 8 }}>Medications</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {structured.medications.map((m, i) => (
                        <span key={i} className="badge blue">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {structured.notes && (
                  <div>
                    <div className="stat-label" style={{ marginBottom: 8 }}>Notes</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{structured.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <pre style={{
                background: 'var(--bg-glass)',
                padding: 16,
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}>
                {JSON.stringify(structured, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
