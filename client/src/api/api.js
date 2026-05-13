const BASE = '/api';

async function request(url, options = {}) {
  try {
    const res = await fetch(`${BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error('Network error — is the API server running on port 5000?');
    }
    throw err;
  }
}

// ── Relief Centers ──
export const getCenters = () => request('/centers');
export const getCenter = (id) => request(`/centers/${id}`);
export const createCenter = (body) => request('/centers', { method: 'POST', body: JSON.stringify(body) });
export const updateCenter = (id, body) => request(`/centers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteCenter = (id) => request(`/centers/${id}`, { method: 'DELETE' });

// ── Inventory ──
export const getInventory = (centerId) => request(`/inventory${centerId ? `?centerId=${centerId}` : ''}`);
export const createInventoryItem = (body) => request('/inventory', { method: 'POST', body: JSON.stringify(body) });
export const updateInventoryItem = (id, body) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const bulkUpdateInventory = (updates) => request('/inventory/bulk', { method: 'PATCH', body: JSON.stringify({ updates }) });
export const deleteInventoryItem = (id) => request(`/inventory/${id}`, { method: 'DELETE' });

// ── Volunteers ──
export const getVolunteers = (status) => request(`/volunteers${status ? `?status=${status}` : ''}`);
export const createVolunteer = (body) => request('/volunteers', { method: 'POST', body: JSON.stringify(body) });
export const updateVolunteer = (id, body) => request(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const dispatchVolunteer = (id, body) => request(`/volunteers/${id}/dispatch`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteVolunteer = (id) => request(`/volunteers/${id}`, { method: 'DELETE' });

// ── Dispatches ──
export const getDispatches = (status) => request(`/dispatches${status ? `?status=${status}` : ''}`);
export const createDispatch = (body) => request('/dispatches', { method: 'POST', body: JSON.stringify(body) });
export const completeDispatch = (id) => request(`/dispatches/${id}/complete`, { method: 'PATCH' });
