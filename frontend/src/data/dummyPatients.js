/**
 * Dummy Patient Dataset — 55 patients with realistic profiles,
 * vitals, medical reports, and affected organ mappings.
 *
 * Each report has an `affected_organs` array that maps to 3D body regions:
 *   brain, heart, lungs, liver, stomach, kidneys, spine
 */

const FIRST_NAMES_M = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advait', 'Dhruv', 'Kabir',
  'Ritvik', 'Anirudh', 'Arnav', 'Rohan', 'Karthik', 'Pranav', 'Yash',
  'Nikhil', 'Rahul', 'Vikram', 'Manish', 'Suresh', 'Rajesh',
];

const FIRST_NAMES_F = [
  'Ananya', 'Diya', 'Saanvi', 'Aanya', 'Aadhya', 'Isha', 'Navya', 'Priya',
  'Kavya', 'Meera', 'Riya', 'Shreya', 'Pooja', 'Neha', 'Swati', 'Anjali',
  'Nisha', 'Deepa', 'Lakshmi', 'Radha', 'Sonia', 'Tanvi', 'Divya',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Gupta',
  'Joshi', 'Mishra', 'Rao', 'Iyer', 'Menon', 'Das', 'Pillai', 'Mehta',
  'Desai', 'Kulkarni', 'Bhat', 'Chauhan', 'Pandey', 'Agarwal',
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CONDITIONS = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Chronic Back Pain',
  'Migraine', 'Coronary Artery Disease', 'GERD', 'Fatty Liver Disease',
  'Chronic Kidney Disease', 'Anxiety Disorder', 'Hypothyroidism',
  'Osteoarthritis', 'Anemia', 'COPD', 'Peptic Ulcer',
];

const MEDICATIONS = [
  'Amlodipine 5mg', 'Metformin 500mg', 'Atorvastatin 20mg', 'Aspirin 75mg',
  'Omeprazole 20mg', 'Losartan 50mg', 'Salbutamol Inhaler', 'Paracetamol 500mg',
  'Levothyroxine 50mcg', 'Telmisartan 40mg', 'Glimepiride 2mg', 'Pantoprazole 40mg',
  'Clopidogrel 75mg', 'Metoprolol 25mg', 'Rosuvastatin 10mg',
];

const ALLERGIES_LIST = [
  'Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Shellfish',
  'Peanuts', 'Latex', 'Codeine', 'None',
];

// ─── Report Templates ────────────────────────────────────────
const REPORT_TEMPLATES = [
  // Heart related
  { title: 'ECG Report', summary: 'Mild ST-segment depression noted. Sinus rhythm with occasional PVCs. Left ventricular hypertrophy suspected.', affected_organs: ['heart'] },
  { title: 'Echocardiogram', summary: 'Ejection fraction 52%. Mild mitral regurgitation. Left atrial enlargement detected.', affected_organs: ['heart'] },
  { title: 'Cardiac Stress Test', summary: 'Exercise tolerance reduced. Ischemic changes noted in anterior leads at peak exercise.', affected_organs: ['heart'] },
  { title: 'Coronary Angiography', summary: 'Mild atherosclerotic changes in LAD. No significant stenosis requiring intervention.', affected_organs: ['heart'] },

  // Lung related
  { title: 'Chest X-Ray', summary: 'Bilateral lower lobe infiltrates noted. No pleural effusion. Cardiothoracic ratio normal.', affected_organs: ['lungs'] },
  { title: 'Pulmonary Function Test', summary: 'FEV1/FVC ratio reduced to 65%. Moderate obstructive pattern consistent with COPD.', affected_organs: ['lungs'] },
  { title: 'CT Chest', summary: 'Ground-glass opacities in right lower lobe. Emphysematous changes in upper lobes.', affected_organs: ['lungs'] },

  // Brain related
  { title: 'MRI Brain', summary: 'Small periventricular white matter hyperintensities. No acute infarct or mass lesion.', affected_organs: ['brain'] },
  { title: 'EEG Report', summary: 'Mild diffuse slowing in theta range. No epileptiform discharges noted.', affected_organs: ['brain'] },
  { title: 'Neurological Assessment', summary: 'Mild cognitive impairment noted in memory recall tests. Cranial nerves intact.', affected_organs: ['brain'] },

  // Liver related
  { title: 'Liver Function Test', summary: 'ALT elevated at 78 U/L. AST 55 U/L. Alkaline phosphatase within normal limits. Grade II fatty liver.', affected_organs: ['liver'] },
  { title: 'Ultrasound Abdomen', summary: 'Hepatomegaly with diffuse fatty infiltration. Mild splenomegaly. No focal lesions.', affected_organs: ['liver'] },
  { title: 'FibroScan Report', summary: 'Liver stiffness 8.2 kPa suggesting F2 fibrosis. CAP score 298 dB/m indicating moderate steatosis.', affected_organs: ['liver'] },

  // Kidney related
  { title: 'Renal Function Panel', summary: 'Serum creatinine 1.8 mg/dL. eGFR 45 mL/min suggesting Stage 3a CKD. Microalbuminuria detected.', affected_organs: ['kidneys'] },
  { title: 'Kidney Ultrasound', summary: 'Right kidney 9.8cm, left kidney 10.2cm. Mild cortical thinning bilaterally. Small cortical cyst in left kidney.', affected_organs: ['kidneys'] },

  // Stomach related
  { title: 'Upper GI Endoscopy', summary: 'Erosive gastritis in antrum. Small hiatal hernia. No Barrett\'s esophagus. H. pylori test positive.', affected_organs: ['stomach'] },
  { title: 'Gastric Biopsy Report', summary: 'Chronic active gastritis with H. pylori organisms. No dysplasia or malignancy.', affected_organs: ['stomach'] },

  // Spine related
  { title: 'MRI Lumbar Spine', summary: 'L4-L5 disc bulge with mild thecal sac compression. Degenerative changes at L5-S1.', affected_organs: ['spine'] },
  { title: 'X-Ray Spine', summary: 'Loss of normal lordosis. Osteophyte formation at L3-L4. Mild disc space narrowing.', affected_organs: ['spine'] },

  // Multi-organ
  { title: 'Complete Blood Panel', summary: 'Hemoglobin 10.2 g/dL indicating mild anemia. WBC and platelets normal. ESR mildly elevated.', affected_organs: ['heart', 'kidneys'] },
  { title: 'Annual Health Checkup', summary: 'Blood pressure elevated. Fasting glucose 142 mg/dL. LDL cholesterol high. Kidney function borderline.', affected_organs: ['heart', 'kidneys', 'liver'] },
  { title: 'Diabetic Screening', summary: 'HbA1c 7.8%. Fundoscopy normal. Peripheral neuropathy in lower limbs. Microalbuminuria present.', affected_organs: ['kidneys', 'brain'] },
];

// ─── Helper Functions ────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function generateDate(monthsAgo) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(randInt(1, 28));
  return d.toISOString().split('T')[0];
}

function computeRiskLevel(value, low, high) {
  if (value < low * 0.85 || value > high * 1.3) return { level: 'critical', severity: 1.0 };
  if (value < low * 0.92 || value > high * 1.15) return { level: 'high', severity: 0.75 };
  if (value < low || value > high) return { level: 'elevated', severity: 0.4 };
  return { level: 'normal', severity: 0.0 };
}

// ─── Generate Patients ──────────────────────────────────────
function generatePatients(count) {
  const patients = [];

  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.45 ? 'male' : 'female';
    const firstName = gender === 'male' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    const lastName = pick(LAST_NAMES);
    const age = randInt(18, 82);

    // Generate vitals — some patients have abnormal values
    const isUnhealthy = Math.random() > 0.5;
    const vitals = {
      heart_rate: isUnhealthy ? randFloat(55, 135) : randFloat(62, 95),
      blood_pressure_systolic: isUnhealthy ? randFloat(95, 175) : randFloat(100, 130),
      blood_pressure_diastolic: isUnhealthy ? randFloat(55, 105) : randFloat(65, 85),
      glucose_level: isUnhealthy ? randFloat(65, 220) : randFloat(75, 105),
      oxygen_saturation: isUnhealthy ? randFloat(88, 99) : randFloat(95, 100),
      temperature: isUnhealthy ? randFloat(97.0, 102.5) : randFloat(97.5, 99.0),
      respiratory_rate: isUnhealthy ? randFloat(10, 28, 0) : randFloat(14, 18, 0),
    };

    // Compute risk scores
    const ranges = {
      heart_rate: [60, 100],
      blood_pressure_systolic: [90, 120],
      blood_pressure_diastolic: [60, 80],
      glucose_level: [70, 100],
      oxygen_saturation: [95, 100],
      temperature: [97.0, 99.0],
      respiratory_rate: [12, 20],
    };

    const risk_scores = {};
    for (const [key, value] of Object.entries(vitals)) {
      const [low, high] = ranges[key];
      risk_scores[key] = { ...computeRiskLevel(value, low, high), value };
    }

    const totalSeverity = Object.values(risk_scores).reduce((s, r) => s + r.severity, 0);
    const avgSeverity = totalSeverity / Object.keys(risk_scores).length;
    const health_score = Math.round(Math.max(0, 100 * (1 - avgSeverity)));

    // Generate reports
    const reportCount = randInt(1, 3);
    const reportTemplates = pickN(REPORT_TEMPLATES, reportCount);
    const reports = reportTemplates.map((tmpl, idx) => ({
      id: `RPT-${String(i + 1).padStart(3, '0')}-${idx + 1}`,
      ...tmpl,
      date: generateDate(randInt(0, 18)),
      doctor: `Dr. ${pick(FIRST_NAMES_M)} ${pick(LAST_NAMES)}`,
    }));

    // Collect all affected organs from reports
    const allAffectedOrgans = [...new Set(reports.flatMap(r => r.affected_organs))];

    // Medical history
    const conditionsCount = randInt(0, 3);
    const conditions = pickN(CONDITIONS, conditionsCount);
    const medsCount = randInt(0, 4);
    const meds = pickN(MEDICATIONS, medsCount);
    const allergyCount = randInt(0, 2);
    const allergies = pickN(ALLERGIES_LIST.filter(a => a !== 'None'), allergyCount);
    if (allergies.length === 0) allergies.push('None');

    patients.push({
      id: `PT-${String(i + 1).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      age,
      gender,
      weight: randFloat(45, 105),
      height: randFloat(148, 190),
      blood_type: pick(BLOOD_TYPES),
      medical_history: conditions.join(', ') || 'No significant history',
      current_medications: meds,
      allergies,
      vitals,
      risk_scores,
      health_score,
      reports,
      affected_organs: allAffectedOrgans,
      model_index: i % 5,
      last_visit: generateDate(randInt(0, 6)),
      created_at: generateDate(randInt(6, 24)),
    });
  }

  return patients;
}

// Generate once and export — stable across renders
const DUMMY_PATIENTS = generatePatients(55);

export default DUMMY_PATIENTS;
