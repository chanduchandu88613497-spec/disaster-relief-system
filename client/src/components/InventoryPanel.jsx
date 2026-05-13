import { useState, useEffect } from 'react';
import { getInventory, getCenters, bulkUpdateInventory, deleteInventoryItem } from '../api/api';
import './InventoryPanel.css';

export default function InventoryPanel() {
  const [inventory, setInventory] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({});
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inv, ctr] = await Promise.all([getInventory(), getCenters()]);
      setInventory(inv.data);
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
    return center ? center.name.split(' ').slice(0, 2).join(' ') : 'Unknown';
  };

  const filtered = inventory.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterCenter !== 'all' && item.centerId !== filterCenter) return false;
    return true;
  });

  const handleBulkUpdate = async () => {
    const updates = Object.entries(bulkUpdates)
      .filter(([_, qty]) => qty !== '' && qty !== undefined)
      .map(([id, quantity]) => ({ id, quantity: Number(quantity) }));

    if (updates.length === 0) {
      showToast('No changes to apply', 'error');
      return;
    }

    try {
      const result = await bulkUpdateInventory(updates);
      showToast(result.summary);
      setShowBulkModal(false);
      setBulkUpdates({});
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryItem(id);
      showToast('Item deleted');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><span>Loading inventory...</span></div>;
  }
  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  const categories = [...new Set(inventory.map(i => i.category))];

  return (
    <div className="panel" id="inventory-view">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">📦 Inventory Management</h1>
          <p className="panel__subtitle">{filtered.length} items · {inventory.reduce((s, i) => s + i.quantity, 0).toLocaleString()} total units</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBulkModal(true)} id="bulk-update-btn">
          ⚡ Bulk Update
        </button>
      </div>

      <div className="panel__filters">
        <select
          className="input"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          id="filter-category"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        <select
          className="input"
          value={filterCenter}
          onChange={(e) => setFilterCenter(e.target.value)}
          id="filter-center"
        >
          <option value="all">All Centers</option>
          {centers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="panel__table-wrapper">
        <table className="data-table" id="inventory-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Center</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id} className={`animate-in animate-in-${Math.min(i + 1, 5)}`}>
                <td className="td-primary">{item.item}</td>
                <td><span className={`badge badge-${item.category === 'medical' ? 'critical' : item.category === 'food' ? 'active' : 'medium'}`}>{item.category}</span></td>
                <td>{getCenterName(item.centerId)}</td>
                <td className={`td-quantity ${item.quantity === 0 ? 'td-quantity--zero' : ''}`}>
                  {item.quantity.toLocaleString()}
                  {item.quantity === 0 && <span className="quantity-alert">⚠️</span>}
                </td>
                <td>{item.unit}</td>
                <td className="td-muted">{new Date(item.lastUpdated).toLocaleString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} id="bulk-modal">
            <div className="modal-header">
              <h2>⚡ Bulk Inventory Update</h2>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>✕</button>
            </div>
            <p className="bulk-modal__desc">Adjust quantities for multiple items at once. Only changed fields will be submitted.</p>
            <div className="bulk-modal__list">
              {inventory.map(item => (
                <div key={item.id} className="bulk-modal__item">
                  <div className="bulk-modal__item-info">
                    <span className="bulk-modal__item-name">{item.item}</span>
                    <span className="bulk-modal__item-center">{getCenterName(item.centerId)}</span>
                  </div>
                  <div className="bulk-modal__item-input">
                    <span className="bulk-modal__item-current">Current: {item.quantity}</span>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder={item.quantity}
                      value={bulkUpdates[item.id] ?? ''}
                      onChange={(e) => setBulkUpdates(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="bulk-modal__actions">
              <button className="btn btn-ghost" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkUpdate} id="bulk-submit-btn">
                Apply {Object.values(bulkUpdates).filter(v => v !== '').length} Changes
              </button>
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
