import { useState, useMemo } from 'react';
import { Search, Users, AlertTriangle, HeartPulse, ChevronRight, Filter, UserPlus } from 'lucide-react';

export default function PatientDirectory({ patients, onSelectPatient }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, health_score, age, last_visit
  const [filterStatus, setFilterStatus] = useState('all'); // all, critical, at-risk, healthy

  // Compute stats
  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p => (p.health_score ?? 75) < 40).length;
    const atRisk = patients.filter(p => (p.health_score ?? 75) >= 40 && (p.health_score ?? 75) < 70).length;
    const healthy = patients.filter(p => (p.health_score ?? 75) >= 70).length;
    const avgScore = total > 0 ? Math.round(patients.reduce((s, p) => s + (p.health_score ?? 75), 0) / total) : 0;
    return { total, critical, atRisk, healthy, avgScore };
  }, [patients]);

  // Filter and sort
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.medical_history || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus === 'critical') result = result.filter(p => (p.health_score ?? 75) < 40);
    else if (filterStatus === 'at-risk') result = result.filter(p => (p.health_score ?? 75) >= 40 && (p.health_score ?? 75) < 70);
    else if (filterStatus === 'healthy') result = result.filter(p => (p.health_score ?? 75) >= 70);

    // Sort
    if (sortBy === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sortBy === 'health_score') result.sort((a, b) => (a.health_score ?? 75) - (b.health_score ?? 75));
    else if (sortBy === 'age') result.sort((a, b) => (b.age || 0) - (a.age || 0));
    else if (sortBy === 'last_visit') result.sort((a, b) => new Date(b.last_visit || 0) - new Date(a.last_visit || 0));

    return result;
  }, [patients, searchQuery, sortBy, filterStatus]);

  function getScoreClass(score) {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  }

  function getScoreLabel(score) {
    if (score >= 80) return 'Healthy';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'At Risk';
    if (score >= 40) return 'Moderate';
    return 'Critical';
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getAvatarColor(name) {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #a855f7, #ec4899)',
      'linear-gradient(135deg, #14b8a6, #22c55e)',
      'linear-gradient(135deg, #f97316, #ef4444)',
      'linear-gradient(135deg, #eab308, #f97316)',
      'linear-gradient(135deg, #06b6d4, #3b82f6)',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Patient Directory</h2>
        <p>Digital Twin monitoring dashboard — Doctor's overview of all patients</p>
      </div>

      {/* Stats Bar */}
      <div className="directory-stats">
        <div className="dir-stat">
          <Users size={20} className="dir-stat-icon blue" />
          <div>
            <div className="dir-stat-value">{stats.total}</div>
            <div className="dir-stat-label">Total Patients</div>
          </div>
        </div>
        <div className="dir-stat">
          <AlertTriangle size={20} className="dir-stat-icon red" />
          <div>
            <div className="dir-stat-value">{stats.critical}</div>
            <div className="dir-stat-label">Critical</div>
          </div>
        </div>
        <div className="dir-stat">
          <HeartPulse size={20} className="dir-stat-icon yellow" />
          <div>
            <div className="dir-stat-value">{stats.atRisk}</div>
            <div className="dir-stat-label">At Risk</div>
          </div>
        </div>
        <div className="dir-stat">
          <HeartPulse size={20} className="dir-stat-icon green" />
          <div>
            <div className="dir-stat-value">{stats.healthy}</div>
            <div className="dir-stat-label">Healthy</div>
          </div>
        </div>
        <div className="dir-stat">
          <HeartPulse size={20} className="dir-stat-icon cyan" />
          <div>
            <div className="dir-stat-value">{stats.avgScore}</div>
            <div className="dir-stat-label">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="directory-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, or condition..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Patients</option>
            <option value="critical">Critical</option>
            <option value="at-risk">At Risk</option>
            <option value="healthy">Healthy</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="health_score">Sort: Health Score</option>
            <option value="age">Sort: Age</option>
            <option value="last_visit">Sort: Last Visit</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="directory-results-count">
        Showing <strong>{filteredPatients.length}</strong> of {patients.length} patients
      </div>

      {/* Patient Grid */}
      <div className="patient-grid">
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            className="patient-card"
            onClick={() => onSelectPatient(patient)}
          >
            {/* Health score indicator bar */}
            <div className={`patient-card-bar ${getScoreClass(patient.health_score ?? 75)}`} />

            <div className="patient-card-top">
              <div className="patient-avatar" style={{ background: getAvatarColor(patient.name) }}>
                {getInitials(patient.name)}
              </div>
              <div className="patient-card-info">
                <div className="patient-card-name">{patient.name}</div>
                <div className="patient-card-id">{patient.id} · {patient.age}y · {patient.gender === 'male' ? '♂' : patient.gender === 'female' ? '♀' : '⚥'}</div>
              </div>
              <div className={`patient-score-badge ${getScoreClass(patient.health_score ?? 75)}`}>
                <span className="score-number">{patient.health_score ?? 75}</span>
                <span className="score-label">{getScoreLabel(patient.health_score ?? 75)}</span>
              </div>
            </div>

            <div className="patient-card-body">
              <div className="patient-card-condition">
                {(patient.medical_history || 'No significant history').length > 60
                  ? (patient.medical_history || 'No significant history').slice(0, 60) + '...'
                  : (patient.medical_history || 'No significant history')}
              </div>

              {(patient.affected_organs || []).length > 0 && (
                <div className="patient-card-organs">
                  {(patient.affected_organs || []).slice(0, 3).map(organ => (
                    <span key={organ} className="organ-tag mini">{organ}</span>
                  ))}
                  {(patient.affected_organs || []).length > 3 && (
                    <span className="organ-tag mini more">+{(patient.affected_organs || []).length - 3}</span>
                  )}
                </div>
              )}
            </div>

            <div className="patient-card-footer">
              <span className="patient-card-date">Last visit: {patient.last_visit || '—'}</span>
              <span className="patient-card-reports">{(patient.reports || []).length} report{(patient.reports || []).length !== 1 ? 's' : ''}</span>
              <ChevronRight size={16} className="patient-card-arrow" />
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && patients.length > 0 && (
        <div className="empty-state">
          <Search size={48} />
          <h3>No Patients Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {patients.length === 0 && (
        <div className="empty-state">
          <UserPlus size={48} />
          <h3>No Patients Registered</h3>
          <p>Register your first patient using the <strong>Register Patient</strong> section in the sidebar to see them here.</p>
        </div>
      )}
    </div>
  );
}
