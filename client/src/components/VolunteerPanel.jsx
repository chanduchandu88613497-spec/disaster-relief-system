import { useState, useEffect } from 'react';
import { getVolunteers, getCenters, dispatchVolunteer, deleteVolunteer } from '../api/api';
import './VolunteerPanel.css';

export default function VolunteerPanel() {
  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedVol, setSelectedVol] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({ centerId: '', mission: '', priority: 'medium' });
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vol, ctr] = await Promise.all([getVolunteers(), getCenters()]);
      setVolunteers(vol.data);
      setCenters(ctr.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCenterName = (centerId) => {
    const center = centers.find(c => c.id === centerId);
    return center ? center.name.split(' ').slice(0, 2).join(' ') : '—';
  };

  const filtered = volunteers.filter(v =>
    filterStatus === 'all' || v.status === filterStatus
  );

  const openDispatch = (vol) => {
    setSelectedVol(vol);
    setDispatchForm({ centerId: centers[0]?.id || '', mission: '', priority: 'medium' });
    setShowDispatchModal(true);
  };

  const handleDispatch = async () => {
    if (!dispatchForm.centerId || !dispatchForm.mission) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      const result = await dispatchVolunteer(selectedVol.id, dispatchForm);
      showToast(result.message);
      setShowDispatchModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVolunteer(id);
      showToast('Volunteer removed');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><span>Loading volunteers...</span></div>;
  }
  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  return (
    <div className="panel" id="volunteers-view">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">👥 Volunteer Management</h1>
          <p className="panel__subtitle">
            {volunteers.length} volunteers · {volunteers.filter(v => v.status === 'available').length} available
          </p>
        </div>
      </div>

      <div className="panel__filters">
        {['all', 'available', 'dispatched', 'off-duty'].map(status => (
          <button
            key={status}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilterStatus(status)}
            id={`filter-vol-${status}`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="panel__table-wrapper">
        <table className="data-table" id="volunteers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Assigned Center</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((vol, i) => (
              <tr key={vol.id} className={`animate-in animate-in-${Math.min(i + 1, 5)}`}>
                <td className="td-primary">{vol.name}</td>
                <td>
                  <div className="skills-list">
                    {vol.skills.map(s => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${vol.status}`}>{vol.status.replace('-', ' ')}</span>
                </td>
                <td className="td-muted">{vol.phone}</td>
                <td>{getCenterName(vol.assignedCenterId)}</td>
                <td>
                  <div className="action-btns">
                    {vol.status === 'available' && (
                      <button className="btn btn-primary btn-sm" onClick={() => openDispatch(vol)}>
                        Dispatch
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vol.id)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && selectedVol && (
        <div className="modal-overlay" onClick={() => setShowDispatchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} id="dispatch-modal">
            <div className="modal-header">
              <h2>🚀 Dispatch {selectedVol.name}</h2>
              <button className="modal-close" onClick={() => setShowDispatchModal(false)}>✕</button>
            </div>

            <div className="dispatch-form">
              <div className="dispatch-form__field">
                <label className="dispatch-form__label">Target Center</label>
                <select
                  className="input"
                  value={dispatchForm.centerId}
                  onChange={(e) => setDispatchForm(prev => ({ ...prev, centerId: e.target.value }))}
                >
                  {centers.filter(c => c.status === 'active').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="dispatch-form__field">
                <label className="dispatch-form__label">Mission</label>
                <input
                  className="input"
                  placeholder="Describe the mission..."
                  value={dispatchForm.mission}
                  onChange={(e) => setDispatchForm(prev => ({ ...prev, mission: e.target.value }))}
                />
              </div>

              <div className="dispatch-form__field">
                <label className="dispatch-form__label">Priority</label>
                <select
                  className="input"
                  value={dispatchForm.priority}
                  onChange={(e) => setDispatchForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="low">🟣 Low</option>
                </select>
              </div>

              <div className="dispatch-form__actions">
                <button className="btn btn-ghost" onClick={() => setShowDispatchModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleDispatch} id="dispatch-submit-btn">
                  🚀 Dispatch Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
