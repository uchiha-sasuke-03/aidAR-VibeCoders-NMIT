import { useState, useEffect } from 'react';
import { FlaskConical, Pill, Salad, ArrowRight, AlertTriangle } from 'lucide-react';
import { runSimulation, getMedications, getLifestyleOptions } from '../services/api';

export default function SimulationPanel({ patient }) {
  const [mode, setMode] = useState('medication');
  const [medications, setMedications] = useState([]);
  const [lifestyleOpts, setLifestyleOpts] = useState([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [selectedLifestyle, setSelectedLifestyle] = useState([]);
  const [duration, setDuration] = useState(6);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMedications().then(r => setMedications(r.medications)).catch(() => {});
    getLifestyleOptions().then(r => setLifestyleOpts(r.options)).catch(() => {});
  }, []);

  const pid = patient?.patient_id || patient?.id;

  const handleRun = async () => {
    if (!pid) return setError('No active patient. Register one first.');
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const params = mode === 'medication'
        ? { medication: selectedMed, duration_months: duration }
        : { changes: selectedLifestyle, duration_months: duration };
      const res = await runSimulation({ patient_id: pid, scenario_type: mode, parameters: params });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLifestyle = (name) => {
    setSelectedLifestyle(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const formatVitalName = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (!patient) {
    return (
      <div className="empty-state fade-in">
        <FlaskConical size={48} />
        <h3>No Active Patient</h3>
        <p>Register a patient first to run What-If simulations on their Digital Twin.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>What-If Simulation Engine</h2>
        <p>Test treatments and lifestyle changes on <strong>{patient.name}</strong>'s digital twin before real application.</p>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          className={`btn ${mode === 'medication' ? 'btn-sim' : 'btn-secondary'}`}
          onClick={() => { setMode('medication'); setResult(null); }}
        >
          <Pill size={16} /> Medication Trial
        </button>
        <button
          className={`btn ${mode === 'lifestyle' ? 'btn-sim' : 'btn-secondary'}`}
          onClick={() => { setMode('lifestyle'); setResult(null); }}
        >
          <Salad size={16} /> Lifestyle Changes
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FlaskConical size={18} />
            {mode === 'medication' ? 'Select Medication to Simulate' : 'Select Lifestyle Changes'}
          </div>
        </div>

        {mode === 'medication' && (
          <div className="sim-controls">
            {medications.map(med => (
              <div
                key={med.name}
                className={`sim-option ${selectedMed === med.name ? 'selected' : ''}`}
                onClick={() => setSelectedMed(med.name)}
              >
                <h4 style={{ textTransform: 'capitalize' }}>💊 {med.name}</h4>
                <p>
                  {Object.entries(med.effects).map(([k, v]) => (
                    <span key={k}>{formatVitalName(k)}: {v > 0 ? '+' : ''}{v} · </span>
                  ))}
                </p>
                {Object.keys(med.side_effects).length > 0 && (
                  <p style={{ color: 'var(--accent-yellow)', marginTop: 4 }}>
                    ⚠ Side Effects: {Object.entries(med.side_effects).map(([k, v]) => `${k.replace(/_/g, ' ')} (${(v * 100).toFixed(0)}%)`).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {mode === 'lifestyle' && (
          <div className="sim-controls">
            {lifestyleOpts.map(opt => (
              <div
                key={opt.name}
                className={`sim-option ${selectedLifestyle.includes(opt.name) ? 'selected' : ''}`}
                onClick={() => toggleLifestyle(opt.name)}
              >
                <h4>🏃 {opt.name.replace(/_/g, ' ')}</h4>
                <p>
                  Monthly: {Object.entries(opt.monthly_effects).map(([k, v]) => (
                    <span key={k}>{formatVitalName(k)}: {v > 0 ? '+' : ''}{v} · </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Duration Slider */}
        <div style={{ margin: '20px 0' }}>
          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Simulation Duration: <strong style={{ color: 'var(--text-primary)' }}>{duration} months</strong>
          </label>
          <input
            type="range"
            min="1"
            max="24"
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent-purple)' }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button className="btn btn-sim" onClick={handleRun} disabled={loading || (mode === 'medication' && !selectedMed) || (mode === 'lifestyle' && selectedLifestyle.length === 0)}>
          {loading ? 'Running Simulation...' : '🔮 Run Simulation'}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="loading-spinner" style={{ marginTop: 24 }}><div className="spinner"></div></div>
      )}

      {result && !loading && (
        <div className="sim-result fade-in" style={{ marginTop: 24 }}>
          <h3><FlaskConical size={20} /> Simulation Results</h3>

          {/* Before/After comparison */}
          <div className="sim-comparison">
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Current Health Score</div>
              <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>
                {patient.health_score?.toFixed(1) || 'N/A'}
              </div>
            </div>
            <div className="sim-arrow"><ArrowRight /></div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Projected Health Score</div>
              <div className="stat-value" style={{ color: result.health_score >= (patient.health_score || 0) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {result.health_score?.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Projected Vitals */}
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
              Projected Vitals After {result.duration_months} Months
            </h4>
            <div className="stats-grid">
              {Object.entries(result.projected_vitals || {}).map(([key, value]) => {
                const original = result.original_vitals?.[key];
                const diff = original ? value - original : 0;
                return (
                  <div key={key} className="stat-tile blue">
                    <div className="stat-label">{formatVitalName(key)}</div>
                    <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </div>
                    {diff !== 0 && (
                      <div style={{ fontSize: '0.75rem', color: diff < 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: 4 }}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} from current
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Effects */}
          {result.side_effects && Object.keys(result.side_effects).length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <AlertTriangle size={16} /> Potential Side Effects
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(result.side_effects).map(([name, prob]) => (
                  <span key={name} className={`badge ${prob >= 0.3 ? 'orange' : 'yellow'}`}>
                    {name.replace(/_/g, ' ')}: {(prob * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {result.ai_explanation && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                AI Analysis
              </h4>
              <div className="ai-report">{result.ai_explanation}</div>
            </div>
          )}

          {/* Confidence */}
          <div style={{ marginTop: 16, textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Simulation Confidence: <strong style={{ color: 'var(--accent-purple)' }}>{(result.confidence * 100).toFixed(0)}%</strong>
          </div>
        </div>
      )}
    </div>
  );
}
