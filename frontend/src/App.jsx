import { useState, useEffect, useCallback } from 'react';
import { Activity, Users, FlaskConical, ScanLine, MessageSquare, LayoutDashboard, UserPlus, Zap } from 'lucide-react';
import WelcomePage from './components/WelcomePage';
import PatientForm from './components/PatientForm';
import Dashboard from './components/Dashboard';
import SimulationPanel from './components/SimulationPanel';
import OCRPanel from './components/OCRPanel';
import ChatPanel from './components/ChatPanel';
import PatientDirectory from './components/PatientDirectory';
import PatientDetail from './components/PatientDetail';
import { listPatients } from './services/api';
import './index.css';

const NAV_ITEMS = [
  { key: 'welcome', label: 'Home', icon: LayoutDashboard, section: 'main' },
  { key: 'register', label: 'Register Patient', icon: UserPlus, section: 'main' },
  { key: 'digital-twin', label: 'Digital Twin', icon: Activity, section: 'twin' },
  { key: 'simulate', label: 'What-If Engine', icon: FlaskConical, section: 'twin' },
  { key: 'ocr', label: 'Scan Reports', icon: ScanLine, section: 'tools' },
  { key: 'chat', label: 'AI Assistant', icon: MessageSquare, section: 'tools' },
];

function App() {
  const [activePage, setActivePage] = useState('welcome');
  const [activePatient, setActivePatient] = useState(null);
  const [selectedDirectoryPatient, setSelectedDirectoryPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  // Fetch all registered patients from the backend
  const fetchPatients = useCallback(async () => {
    try {
      const data = await listPatients();
      // Normalize backend patients to match the shape the directory expects
      const normalized = data.map((p, idx) => ({
        id: p.id || p.patient_id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        weight: p.weight,
        height: p.height,
        blood_type: p.blood_type || '—',
        medical_history: p.medical_history || 'No significant history',
        current_medications: p.current_medications || [],
        allergies: p.allergies || [],
        vitals: p.vitals || {},
        risk_scores: p.risk_scores || {},
        health_score: p.health_score ?? 75,
        reports: p.reports || [],
        affected_organs: p.affected_organs || [],
        model_index: idx % 5,
        last_visit: p.last_visit || new Date().toISOString().split('T')[0],
        created_at: p.created_at || new Date().toISOString().split('T')[0],
      }));
      setPatients(normalized);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Re-fetch when navigating to the digital-twin page
  useEffect(() => {
    if (activePage === 'digital-twin') {
      fetchPatients();
    }
  }, [activePage, fetchPatients]);

  const handlePatientCreated = (patient) => {
    setActivePatient(patient);
    // Also add the new patient to the local list immediately so it shows up right away
    const newEntry = {
      id: patient.patient_id || patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      weight: patient.weight,
      height: patient.height,
      blood_type: patient.blood_type || '—',
      medical_history: patient.medical_history || 'No significant history',
      current_medications: patient.current_medications || [],
      allergies: patient.allergies || [],
      vitals: patient.vitals || {},
      risk_scores: patient.risk_scores || {},
      health_score: patient.health_score ?? 75,
      reports: patient.reports || [],
      affected_organs: patient.affected_organs || [],
      model_index: patients.length % 5,
      last_visit: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
    };
    setPatients(prev => [...prev, newEntry]);
    setActivePage('dashboard');
  };

  const handleVitalsUpdated = (data) => {
    setActivePatient(prev => ({ ...prev, ...data }));
  };

  const handleSelectDirectoryPatient = (patient) => {
    setSelectedDirectoryPatient(patient);
    setActivePage('patient-detail');
  };

  const handleBackToDirectory = () => {
    setSelectedDirectoryPatient(null);
    setActivePage('digital-twin');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'welcome':
        return <WelcomePage onNavigate={setActivePage} />;
      case 'register':
        return <PatientForm onPatientCreated={handlePatientCreated} />;
      case 'dashboard':
        return <Dashboard patient={activePatient} onVitalsUpdated={handleVitalsUpdated} onNavigate={setActivePage} />;
      case 'digital-twin':
        return <PatientDirectory patients={patients} onSelectPatient={handleSelectDirectoryPatient} />;
      case 'patient-detail':
        return selectedDirectoryPatient
          ? <PatientDetail patient={selectedDirectoryPatient} onBack={handleBackToDirectory} />
          : <PatientDirectory patients={patients} onSelectPatient={handleSelectDirectoryPatient} />;
      case 'simulate':
        return <SimulationPanel patient={activePatient} />;
      case 'ocr':
        return <OCRPanel />;
      case 'chat':
        return <ChatPanel patient={activePatient} />;
      default:
        return <WelcomePage onNavigate={setActivePage} />;
    }
  };

  const sections = [
    { key: 'main', title: 'Navigation' },
    { key: 'twin', title: 'Digital Twin' },
    { key: 'tools', title: 'AI Tools' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Zap size={20} color="white" /></div>
          <div>
            <h1>HealthTwin</h1>
            <div className="brand-sub">AI Digital Twin</div>
          </div>
        </div>

        {sections.map(section => (
          <div key={section.key}>
            <div className="nav-section-title">{section.title}</div>
            {NAV_ITEMS.filter(n => n.section === section.key).map(item => (
              <div
                key={item.key}
                className={`nav-link ${activePage === item.key || (item.key === 'digital-twin' && activePage === 'patient-detail') ? 'active' : ''}`}
                onClick={() => setActivePage(item.key)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}

        {activePatient && (
          <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="stat-label">Active Patient</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 4 }}>{activePatient.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ID: {activePatient.patient_id || activePatient.id}</div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
