import { useState, useCallback } from 'react';
import { UserPlus, ChevronRight, Upload, ScanLine, Zap, FileText, CheckCircle2 } from 'lucide-react';
import { createPatient, updateVitals, ocrExtract } from '../services/api';

export default function PatientForm({ onPatientCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '', age: '', gender: 'male', weight: '', height: '',
    blood_type: '', medical_history: '', current_medications: '', allergies: '',
  });

  const [vitals, setVitals] = useState({
    heart_rate: '', blood_pressure_systolic: '', blood_pressure_diastolic: '',
    glucose_level: '', oxygen_saturation: '98', temperature: '98.6', respiratory_rate: '16',
  });

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleVitalsChange = (e) => setVitals({ ...vitals, [e.target.name]: e.target.value });

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setError('');
    setOcrSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const res = await ocrExtract(base64);
        
        if (res.structured_data) {
          const data = res.structured_data;
          
          // Auto-fill profile
          setProfile(prev => ({
            ...prev,
            name: data.patient_name || prev.name,
            medical_history: data.diagnosis ? data.diagnosis.join(', ') : prev.medical_history,
            current_medications: data.medications ? data.medications.join(', ') : prev.current_medications,
            notes: data.notes || prev.notes
          }));

          // Auto-fill vitals
          if (data.vitals) {
            setVitals(prev => ({
              ...prev,
              heart_rate: data.vitals.heart_rate || prev.heart_rate,
              blood_pressure_systolic: data.vitals.blood_pressure_systolic || prev.blood_pressure_systolic,
              blood_pressure_diastolic: data.vitals.blood_pressure_diastolic || prev.blood_pressure_diastolic,
              glucose_level: data.vitals.glucose_level || prev.glucose_level,
              oxygen_saturation: data.vitals.oxygen_saturation || prev.oxygen_saturation,
              temperature: data.vitals.temperature || prev.temperature,
              respiratory_rate: data.vitals.respiratory_rate || prev.respiratory_rate,
            }));
          }
          
          setOcrSuccess(true);
          // Wait a bit to show success then go to profile step
          setTimeout(() => setStep(2), 1500);
        }
        setOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("OCR Failed: " + err.message);
      setOcrLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const patientData = {
        ...profile,
        age: parseInt(profile.age),
        weight: parseFloat(profile.weight),
        height: parseFloat(profile.height),
        current_medications: profile.current_medications ? profile.current_medications.split(',').map(s => s.trim()) : [],
        allergies: profile.allergies ? profile.allergies.split(',').map(s => s.trim()) : [],
      };

      const result = await createPatient(patientData);
      const pid = result.patient_id;

      // Submit vitals
      const vitalsData = {};
      for (const [k, v] of Object.entries(vitals)) {
        vitalsData[k] = parseFloat(v);
      }
      const vitalsResult = await updateVitals(pid, vitalsData);

      onPatientCreated({
        ...result.patient,
        patient_id: pid,
        ...vitalsResult,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Register New Patient</h2>
        <p>Create a digital twin by scanning a report or entering data manually.</p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {['Scan Report', 'Patient Profile', 'Vitals Data'].map((label, i) => (
          <div
            key={i}
            onClick={() => setStep(i + 1)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-xl)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: step === i + 1 ? 'var(--gradient-primary)' : 'var(--bg-glass)',
              border: `1px solid ${step === i + 1 ? 'transparent' : 'var(--border-subtle)'}`,
              color: step === i + 1 ? 'white' : 'var(--text-secondary)',
            }}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div className="fade-in">
            <div className="card-header">
              <div className="card-title"><ScanLine size={18} /> OCR Report Scanner</div>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Upload a picture of a medical report to auto-fill the patient's profile and vitals.
            </p>

            <label className="ocr-dropzone" htmlFor="register-ocr-input" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 12,
              padding: '40px 20px',
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              {ocrLoading ? (
                <div className="spinner"></div>
              ) : ocrSuccess ? (
                <CheckCircle2 size={48} color="var(--accent-green)" />
              ) : (
                <Upload size={48} color="var(--text-muted)" />
              )}
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {ocrLoading ? 'Processing Report...' : ocrSuccess ? 'Data Extracted!' : 'Click to upload medical report'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, TIFF
                </p>
              </div>
              
              <input
                id="register-ocr-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={ocrLoading}
              />
            </label>

            {error && (
              <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Skip and Enter Manually <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="card-header">
              <div className="card-title"><UserPlus size={18} /> Patient Information</div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={profile.name} onChange={handleProfileChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input name="age" type="number" value={profile.age} onChange={handleProfileChange} placeholder="45" />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={profile.gender} onChange={handleProfileChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Weight (kg) *</label>
                <input name="weight" type="number" value={profile.weight} onChange={handleProfileChange} placeholder="75" />
              </div>
              <div className="form-group">
                <label>Height (cm) *</label>
                <input name="height" type="number" value={profile.height} onChange={handleProfileChange} placeholder="175" />
              </div>
              <div className="form-group">
                <label>Blood Type</label>
                <select name="blood_type" value={profile.blood_type} onChange={handleProfileChange}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Medical History</label>
                <textarea name="medical_history" value={profile.medical_history} onChange={handleProfileChange}
                  placeholder="Prior conditions, surgeries, family history..." />
              </div>
              <div className="form-group">
                <label>Current Medications (comma-separated)</label>
                <input name="current_medications" value={profile.current_medications} onChange={handleProfileChange}
                  placeholder="Lisinopril, Metformin" />
              </div>
              <div className="form-group">
                <label>Allergies (comma-separated)</label>
                <input name="allergies" value={profile.allergies} onChange={handleProfileChange}
                  placeholder="Penicillin, Shellfish" />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Next: Vitals <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card-header">
              <div className="card-title"><UserPlus size={18} /> Current Vitals</div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Heart Rate (BPM) *</label>
                <input name="heart_rate" type="number" value={vitals.heart_rate} onChange={handleVitalsChange} placeholder="72" />
              </div>
              <div className="form-group">
                <label>Systolic BP (mmHg) *</label>
                <input name="blood_pressure_systolic" type="number" value={vitals.blood_pressure_systolic} onChange={handleVitalsChange} placeholder="120" />
              </div>
              <div className="form-group">
                <label>Diastolic BP (mmHg) *</label>
                <input name="blood_pressure_diastolic" type="number" value={vitals.blood_pressure_diastolic} onChange={handleVitalsChange} placeholder="80" />
              </div>
              <div className="form-group">
                <label>Blood Glucose (mg/dL) *</label>
                <input name="glucose_level" type="number" value={vitals.glucose_level} onChange={handleVitalsChange} placeholder="95" />
              </div>
              <div className="form-group">
                <label>SpO2 (%)</label>
                <input name="oxygen_saturation" type="number" value={vitals.oxygen_saturation} onChange={handleVitalsChange} />
              </div>
              <div className="form-group">
                <label>Temperature (°F)</label>
                <input name="temperature" type="number" step="0.1" value={vitals.temperature} onChange={handleVitalsChange} />
              </div>
              <div className="form-group">
                <label>Respiratory Rate (breaths/min)</label>
                <input name="respiratory_rate" type="number" value={vitals.respiratory_rate} onChange={handleVitalsChange} />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating Digital Twin...' : '🧬 Create Digital Twin'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
