import { useState, useEffect } from 'react';
import { getDispatches, completeDispatch } from '../api/api';
import './DispatchPanel.css';

export default function DispatchPanel() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDispatches();
      setDispatches(res.data);
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

  const handleComplete = async (id) => {
    try {
      const result = await completeDispatch(id);
      showToast(result.message);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = dispatches.filter(d =>
    filterStatus === 'all' || d.status === filterStatus
  );

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><span>Loading dispatches...</span></div>;
  }
  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  return (
    <div className="panel" id="dispatches-view">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">🚀 Dispatch Operations</h1>
          <p className="panel__subtitle">
            {dispatches.filter(d => d.status !== 'completed').length} active missions
          </p>
        </div>
      </div>

      <div className="panel__filters">
        {['all', 'pending', 'in-transit', 'completed'].map(status => (
          <button
            key={status}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilterStatus(status)}
            id={`filter-disp-${status}`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="dispatch-grid">
        {filtered.map((d, i) => (
          <div
            key={d.id}
            className={`dispatch-card glass-card animate-in animate-in-${Math.min(i + 1, 5)}`}
            id={`dispatch-${d.id}`}
          >
            <div className="dispatch-card__top">
              <span className={`badge badge-${d.priority}`}>{d.priority}</span>
              <span className={`badge badge-${d.status}`}>{d.status.replace('-', ' ')}</span>
            </div>

            <p className="dispatch-card__mission">{d.mission}</p>

            <div className="dispatch-card__details">
              <div className="dispatch-card__detail">
                <span className="dispatch-card__detail-label">Volunteer</span>
                <span className="dispatch-card__detail-value">{d.volunteerName}</span>
              </div>
              <div className="dispatch-card__detail">
                <span className="dispatch-card__detail-label">Center</span>
                <span className="dispatch-card__detail-value">{d.centerName}</span>
              </div>
              <div className="dispatch-card__detail">
                <span className="dispatch-card__detail-label">Dispatched</span>
                <span className="dispatch-card__detail-value">{timeAgo(d.dispatchedAt)}</span>
              </div>
              {d.completedAt && (
                <div className="dispatch-card__detail">
                  <span className="dispatch-card__detail-label">Completed</span>
                  <span className="dispatch-card__detail-value">{timeAgo(d.completedAt)}</span>
                </div>
              )}
            </div>

            {d.status !== 'completed' && (
              <button
                className="btn btn-primary dispatch-card__complete"
                onClick={() => handleComplete(d.id)}
              >
                ✅ Mark Complete
              </button>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="dispatch-empty">
            <span>No dispatches found for this filter.</span>
          </div>
        )}
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
