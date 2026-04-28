import { useState, useEffect } from 'react';
import { Activity, Heart, Droplets, Wind, Thermometer, Gauge, FileText, Users } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { getAIReport } from '../services/api';

const VITAL_META = {
  heart_rate: { label: 'Heart Rate', unit: 'BPM', icon: Heart, color: 'red', tile: 'red' },
  blood_pressure_systolic: { label: 'Systolic BP', unit: 'mmHg', icon: Gauge, color: 'orange', tile: 'orange' },
  blood_pressure_diastolic: { label: 'Diastolic BP', unit: 'mmHg', icon: Gauge, color: 'yellow', tile: 'yellow' },
  glucose_level: { label: 'Glucose', unit: 'mg/dL', icon: Droplets, color: 'purple', tile: 'purple' },
  oxygen_saturation: { label: 'SpO2', unit: '%', icon: Wind, color: 'cyan', tile: 'cyan' },
  temperature: { label: 'Temperature', unit: '°F', icon: Thermometer, color: 'green', tile: 'green' },
  respiratory_rate: { label: 'Resp. Rate', unit: '/min', icon: Activity, color: 'blue', tile: 'blue' },
};

function HealthScoreRing({ score }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="health-ring">
      <svg viewBox="0 0 180 180">
        <circle className="ring-bg" cx="90" cy="90" r={radius} />
        <circle
          className="ring-fill"
          cx="90" cy="90" r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-label">
        <div className="ring-value" style={{ color }}>{score}</div>
        <div className="ring-text">Health Score</div>
      </div>
    </div>
  );
}

export default function Dashboard({ patient, onNavigate }) {
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  if (!patient) {
    return (
      <div className="empty-state fade-in">
        <Activity size={48} />
        <h3>No Active Patient</h3>
        <p>Register a patient first to view their Digital Twin dashboard.</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => onNavigate('register')}>
          Register Patient
        </button>
      </div>
    );
  }

  const vitals = patient.vitals || {};
  const riskScores = patient.risk_scores || {};
  const healthScore = patient.health_score || 0;
  const similarCases = patient.similar_cases || [];
  const pid = patient.patient_id || patient.id;

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const res = await getAIReport(pid);
      setReport(res.report);
    } catch (err) {
      setReport('Error generating report: ' + err.message);
    } finally {
      setLoadingReport(false);
    }
  };

  // Radar chart data
  const radarData = Object.entries(patient.normalized || {}).map(([key, val]) => ({
    metric: VITAL_META[key]?.label || key,
    value: Math.round(val * 100),
    fullMark: 100,
  }));

  // Bar chart data for risk severity
  const barData = Object.entries(riskScores).map(([key, val]) => ({
    name: VITAL_META[key]?.label || key,
    severity: val.severity * 100,
    level: val.level,
  }));

  const barColors = { normal: '#22c55e', elevated: '#eab308', high: '#f97316', critical: '#ef4444' };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Digital Twin Dashboard</h2>
        <p>Live health simulation for <strong>{patient.name}</strong> (ID: {pid})</p>
      </div>

      {/* Vitals Grid */}
      <div className="stats-grid">
        {Object.entries(vitals).map(([key, value]) => {
          const meta = VITAL_META[key];
          if (!meta) return null;
          const risk = riskScores[key];
          return (
            <div key={key} className={`stat-tile ${meta.tile}`}>
              <div className="stat-label">{meta.label}</div>
              <div className="stat-value">
                {typeof value === 'number' ? value.toFixed(1) : value}
                <span className="stat-unit">{meta.unit}</span>
              </div>
              {risk && <div className={`stat-status ${risk.level}`}>{risk.level}</div>}
            </div>
          );
        })}
      </div>

      {/* Health Score + Charts */}
      <div className="charts-grid">
        {/* Health Score Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Activity size={18} /> Overall Health Score</div>
            <span className={`badge ${healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : healthScore >= 40 ? 'orange' : 'red'}`}>
              {healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Moderate' : healthScore >= 40 ? 'At Risk' : 'Critical'}
            </span>
          </div>
          <div className="health-score-container">
            <HealthScoreRing score={healthScore} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Gauge size={18} /> Normalized Vitals Profile</div>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No normalized data available</p></div>
          )}
        </div>

        {/* Risk Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Activity size={18} /> Risk Severity Breakdown</div>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="severity" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={barColors[entry.level] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No risk data available</p></div>
          )}
        </div>

        {/* Similar Cases */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Users size={18} /> Similar Patient Cases (FAISS)</div>
          </div>
          {similarCases.length > 0 ? (
            <div className="case-list">
              {similarCases.map((c, i) => (
                <div key={i} className="case-item">
                  <div className="case-rank">{c.rank}</div>
                  <div>
                    <div className="case-label">{c.label}</div>
                  </div>
                  <div className="case-distance">Distance: {c.distance.toFixed(4)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>No similar cases found</p></div>
          )}
        </div>
      </div>

      {/* AI Report Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div className="card-title"><FileText size={18} /> AI Health Report (GPT)</div>
          <button className="btn btn-primary" onClick={handleGenerateReport} disabled={loadingReport}>
            {loadingReport ? 'Generating...' : '🧠 Generate AI Report'}
          </button>
        </div>
        {loadingReport && (
          <div className="loading-spinner"><div className="spinner"></div></div>
        )}
        {report && !loadingReport && (
          <div className="ai-report">{report}</div>
        )}
        {!report && !loadingReport && (
          <div className="empty-state">
            <p>Click "Generate AI Report" to get a GPT-powered health analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
