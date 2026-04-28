import { useState, useMemo } from 'react';
import {
  ArrowLeft, Heart, Droplets, Wind, Thermometer, Gauge, Activity,
  FileText, Plus, X, Calendar, User, Pill, AlertCircle, Stethoscope,
} from 'lucide-react';
import BodyViewer3D from './BodyViewer3D';

const ORGAN_OPTIONS = [
  { id: 'brain', label: 'Brain' },
  { id: 'heart', label: 'Heart' },
  { id: 'lungs', label: 'Lungs' },
  { id: 'liver', label: 'Liver' },
  { id: 'stomach', label: 'Stomach' },
  { id: 'kidneys', label: 'Kidneys' },
  { id: 'spine', label: 'Spine' },
];

const VITAL_META = {
  heart_rate: { label: 'Heart Rate', unit: 'BPM', icon: Heart, color: 'red' },
  blood_pressure_systolic: { label: 'Systolic BP', unit: 'mmHg', icon: Gauge, color: 'orange' },
  blood_pressure_diastolic: { label: 'Diastolic BP', unit: 'mmHg', icon: Gauge, color: 'yellow' },
  glucose_level: { label: 'Glucose', unit: 'mg/dL', icon: Droplets, color: 'purple' },
  oxygen_saturation: { label: 'SpO₂', unit: '%', icon: Wind, color: 'cyan' },
  temperature: { label: 'Temperature', unit: '°F', icon: Thermometer, color: 'green' },
  respiratory_rate: { label: 'Resp. Rate', unit: '/min', icon: Activity, color: 'blue' },
};

export default function PatientDetail({ patient: initialPatient, onBack }) {
  const [patient, setPatient] = useState({
    ...initialPatient,
    reports: initialPatient.reports || [],
    affected_organs: initialPatient.affected_organs || [],
    current_medications: initialPatient.current_medications || [],
    allergies: initialPatient.allergies || [],
    vitals: initialPatient.vitals || {},
    risk_scores: initialPatient.risk_scores || {},
    health_score: initialPatient.health_score ?? 75,
    medical_history: initialPatient.medical_history || 'No significant history',
  });
  const [showAddReport, setShowAddReport] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    affected_organs: [],
    doctor: '',
  });

  // Collect all affected organs across all reports
  const highlightedOrgans = useMemo(() => {
    return [...new Set((patient.reports || []).flatMap(r => r.affected_organs || []))];
  }, [patient.reports]);

  const handleAddReport = () => {
    if (!newReport.title || !newReport.summary) return;

    const report = {
      id: `RPT-${patient.id.split('-')[1]}-${patient.reports.length + 1}`,
      ...newReport,
    };

    const updatedPatient = {
      ...patient,
      reports: [...patient.reports, report],
      affected_organs: [...new Set([...patient.affected_organs, ...newReport.affected_organs])],
    };

    setPatient(updatedPatient);
    setNewReport({ title: '', date: new Date().toISOString().split('T')[0], summary: '', affected_organs: [], doctor: '' });
    setShowAddReport(false);
  };

  const toggleOrgan = (organId) => {
    setNewReport(prev => ({
      ...prev,
      affected_organs: prev.affected_organs.includes(organId)
        ? prev.affected_organs.filter(o => o !== organId)
        : [...prev.affected_organs, organId],
    }));
  };

  function getScoreClass(score) {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  }

  return (
    <div className="fade-in">
      {/* Back button */}
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Patient Directory
      </button>

      {/* Patient Header */}
      <div className="patient-detail-header">
        <div className="detail-avatar" style={{
          background: `linear-gradient(135deg, ${patient.health_score >= 70 ? '#14b8a6, #22c55e' : patient.health_score >= 40 ? '#eab308, #f97316' : '#ef4444, #f97316'})`,
        }}>
          {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="detail-header-info">
          <h2>{patient.name}</h2>
          <div className="detail-header-meta">
            <span><User size={14} /> {patient.id}</span>
            <span><Calendar size={14} /> {patient.age} years old</span>
            <span>{patient.gender === 'male' ? '♂ Male' : '♀ Female'}</span>
            <span>Blood Type: {patient.blood_type}</span>
            <span>{patient.weight} kg · {patient.height} cm</span>
          </div>
        </div>
        <div className={`detail-health-score ${getScoreClass(patient.health_score)}`}>
          <div className="detail-score-number">{patient.health_score}</div>
          <div className="detail-score-label">Health Score</div>
        </div>
      </div>

      {/* Split Layout */}
      <div className="patient-detail-layout">
        {/* Left Panel — Info & Reports */}
        <div className="detail-left">

          {/* Medical Info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Stethoscope size={18} /> Medical Information</div>
            </div>
            <div className="detail-medical-grid">
              <div className="detail-med-item">
                <div className="detail-med-label">Medical History</div>
                <div className="detail-med-value">{patient.medical_history}</div>
              </div>
              <div className="detail-med-item">
                <div className="detail-med-label"><Pill size={14} /> Current Medications</div>
                <div className="detail-med-tags">
                  {patient.current_medications.length > 0
                    ? patient.current_medications.map((m, i) => (
                        <span key={i} className="med-tag">{m}</span>
                      ))
                    : <span className="detail-med-value">None</span>}
                </div>
              </div>
              <div className="detail-med-item">
                <div className="detail-med-label"><AlertCircle size={14} /> Allergies</div>
                <div className="detail-med-tags">
                  {patient.allergies.map((a, i) => (
                    <span key={i} className="med-tag allergy">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Activity size={18} /> Current Vitals</div>
            </div>
            <div className="detail-vitals-grid">
              {Object.entries(patient.vitals || {}).map(([key, value]) => {
                const meta = VITAL_META[key];
                if (!meta) return null;
                const risk = patient.risk_scores?.[key];
                const Icon = meta.icon;
                return (
                  <div key={key} className={`detail-vital-tile ${meta.color}`}>
                    <div className="detail-vital-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="detail-vital-label">{meta.label}</div>
                      <div className="detail-vital-value">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        <span className="detail-vital-unit">{meta.unit}</span>
                      </div>
                    </div>
                    {risk && <div className={`detail-vital-status ${risk.level}`}>{risk.level}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports Section */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><FileText size={18} /> Medical Reports ({patient.reports.length})</div>
              <button className="btn btn-primary" onClick={() => setShowAddReport(true)}>
                <Plus size={16} /> Add Report
              </button>
            </div>

            {/* Add Report Form */}
            {showAddReport && (
              <div className="add-report-form">
                <div className="add-report-header">
                  <h4>New Medical Report</h4>
                  <button className="btn-icon" onClick={() => setShowAddReport(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Report Title *</label>
                    <input
                      value={newReport.title}
                      onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                      placeholder="e.g., ECG Report, MRI Brain"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newReport.date}
                      onChange={e => setNewReport({ ...newReport, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Doctor Name</label>
                    <input
                      value={newReport.doctor}
                      onChange={e => setNewReport({ ...newReport, doctor: e.target.value })}
                      placeholder="Dr. Name"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Summary *</label>
                    <textarea
                      value={newReport.summary}
                      onChange={e => setNewReport({ ...newReport, summary: e.target.value })}
                      placeholder="Describe the findings..."
                      rows={3}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Affected Organs (click to select)</label>
                    <div className="organ-selector">
                      {ORGAN_OPTIONS.map(organ => (
                        <button
                          key={organ.id}
                          type="button"
                          className={`organ-select-btn ${newReport.affected_organs.includes(organ.id) ? 'selected' : ''}`}
                          onClick={() => toggleOrgan(organ.id)}
                        >
                          {organ.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button className="btn btn-success" onClick={handleAddReport} disabled={!newReport.title || !newReport.summary}>
                    Save Report
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowAddReport(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reports List */}
            <div className="reports-list">
              {patient.reports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="report-item-header">
                    <div className="report-item-title">
                      <FileText size={16} />
                      {report.title}
                    </div>
                    <div className="report-item-date">{report.date}</div>
                  </div>
                  <div className="report-item-summary">{report.summary}</div>
                  <div className="report-item-footer">
                    <div className="report-item-organs">
                      {report.affected_organs.map(organ => (
                        <span key={organ} className="organ-tag affected">{organ}</span>
                      ))}
                    </div>
                    {report.doctor && <div className="report-item-doctor">{report.doctor}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — 3D Body Viewer */}
        <div className="detail-right">
          <div className="card body-viewer-card">
            <div className="card-header">
              <div className="card-title"><Activity size={18} /> 3D Digital Twin</div>
              <span className="badge blue">{highlightedOrgans.length} area{highlightedOrgans.length !== 1 ? 's' : ''} flagged</span>
            </div>
            <BodyViewer3D highlightedOrgans={highlightedOrgans} />
          </div>
        </div>
      </div>
    </div>
  );
}
