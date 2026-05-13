const { v4: uuidv4 } = require('uuid');

// ── Relief Centers (Indian cities for realistic coordinates) ──
const centers = [
  {
    id: uuidv4(),
    name: 'Chennai Flood Relief Hub',
    location: { lat: 13.0827, lng: 80.2707 },
    address: 'Marina Beach Rd, Chennai, Tamil Nadu',
    status: 'active',
    capacity: 500,
    currentLoad: 387
  },
  {
    id: uuidv4(),
    name: 'Mumbai Cyclone Shelter',
    location: { lat: 19.076, lng: 72.8777 },
    address: 'Dadar West, Mumbai, Maharashtra',
    status: 'active',
    capacity: 800,
    currentLoad: 724
  },
  {
    id: uuidv4(),
    name: 'Kolkata Emergency Center',
    location: { lat: 22.5726, lng: 88.3639 },
    address: 'Salt Lake, Kolkata, West Bengal',
    status: 'full',
    capacity: 300,
    currentLoad: 300
  },
  {
    id: uuidv4(),
    name: 'Delhi Aid Distribution Point',
    location: { lat: 28.7041, lng: 77.1025 },
    address: 'Connaught Place, New Delhi',
    status: 'active',
    capacity: 600,
    currentLoad: 198
  },
  {
    id: uuidv4(),
    name: 'Kerala Rescue Base Camp',
    location: { lat: 9.9312, lng: 76.2673 },
    address: 'Marine Drive, Kochi, Kerala',
    status: 'active',
    capacity: 450,
    currentLoad: 410
  },
  {
    id: uuidv4(),
    name: 'Odisha Storm Response Unit',
    location: { lat: 20.2961, lng: 85.8245 },
    address: 'Bhubaneswar, Odisha',
    status: 'closed',
    capacity: 350,
    currentLoad: 0
  }
];

// ── Inventory Items ──
const inventory = [
  { id: uuidv4(), centerId: centers[0].id, item: 'Rice (25kg bags)', category: 'food', quantity: 320, unit: 'bags', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[0].id, item: 'Drinking Water', category: 'water', quantity: 1500, unit: 'liters', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[0].id, item: 'First Aid Kits', category: 'medical', quantity: 85, unit: 'kits', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[1].id, item: 'Tarpaulin Sheets', category: 'shelter', quantity: 200, unit: 'pieces', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[1].id, item: 'Canned Food', category: 'food', quantity: 600, unit: 'cans', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[1].id, item: 'Antibiotics', category: 'medical', quantity: 150, unit: 'boxes', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[1].id, item: 'Blankets', category: 'clothing', quantity: 400, unit: 'pieces', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[2].id, item: 'Oral Rehydration Salts', category: 'medical', quantity: 500, unit: 'packets', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[2].id, item: 'Purified Water Bottles', category: 'water', quantity: 2000, unit: 'bottles', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[3].id, item: 'Wheat Flour', category: 'food', quantity: 180, unit: 'bags', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[3].id, item: 'Tents (4-person)', category: 'shelter', quantity: 75, unit: 'tents', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[3].id, item: 'Winter Jackets', category: 'clothing', quantity: 250, unit: 'pieces', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[4].id, item: 'IV Fluid Bags', category: 'medical', quantity: 60, unit: 'bags', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[4].id, item: 'Ready-to-Eat Meals', category: 'food', quantity: 900, unit: 'packets', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[4].id, item: 'Life Jackets', category: 'shelter', quantity: 120, unit: 'pieces', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[4].id, item: 'Water Purification Tablets', category: 'water', quantity: 3000, unit: 'tablets', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[5].id, item: 'Dry Rations', category: 'food', quantity: 0, unit: 'boxes', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), centerId: centers[5].id, item: 'Surgical Masks', category: 'medical', quantity: 0, unit: 'boxes', lastUpdated: new Date().toISOString() },
];

// ── Volunteers ──
const volunteers = [
  { id: uuidv4(), name: 'Priya Sharma', skills: ['First Aid', 'Search & Rescue'], status: 'available', phone: '+91 98765 43210', assignedCenterId: null },
  { id: uuidv4(), name: 'Rahul Verma', skills: ['Logistics', 'Driving'], status: 'dispatched', phone: '+91 87654 32109', assignedCenterId: centers[0].id },
  { id: uuidv4(), name: 'Anjali Patel', skills: ['Medical', 'Counseling'], status: 'dispatched', phone: '+91 76543 21098', assignedCenterId: centers[1].id },
  { id: uuidv4(), name: 'Vikram Singh', skills: ['Construction', 'Electrical'], status: 'available', phone: '+91 65432 10987', assignedCenterId: null },
  { id: uuidv4(), name: 'Deepa Nair', skills: ['Cooking', 'First Aid'], status: 'available', phone: '+91 54321 09876', assignedCenterId: null },
  { id: uuidv4(), name: 'Arjun Reddy', skills: ['Communication', 'Translation'], status: 'off-duty', phone: '+91 43210 98765', assignedCenterId: null },
  { id: uuidv4(), name: 'Meera Krishnan', skills: ['Medical', 'Nursing'], status: 'dispatched', phone: '+91 32109 87654', assignedCenterId: centers[4].id },
  { id: uuidv4(), name: 'Suresh Kumar', skills: ['Driving', 'Navigation'], status: 'available', phone: '+91 21098 76543', assignedCenterId: null },
  { id: uuidv4(), name: 'Lakshmi Iyer', skills: ['Logistics', 'Data Entry'], status: 'off-duty', phone: '+91 10987 65432', assignedCenterId: null },
  { id: uuidv4(), name: 'Karthik Menon', skills: ['Search & Rescue', 'Swimming'], status: 'dispatched', phone: '+91 99887 76655', assignedCenterId: centers[2].id },
];

// ── Dispatches ──
const dispatches = [
  {
    id: uuidv4(),
    volunteerId: volunteers[1].id,
    volunteerName: volunteers[1].name,
    centerId: centers[0].id,
    centerName: centers[0].name,
    mission: 'Deliver medical supplies to flood-affected area',
    priority: 'critical',
    status: 'in-transit',
    dispatchedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: null
  },
  {
    id: uuidv4(),
    volunteerId: volunteers[2].id,
    volunteerName: volunteers[2].name,
    centerId: centers[1].id,
    centerName: centers[1].name,
    mission: 'Provide medical aid at cyclone shelter',
    priority: 'high',
    status: 'in-transit',
    dispatchedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: null
  },
  {
    id: uuidv4(),
    volunteerId: volunteers[6].id,
    volunteerName: volunteers[6].name,
    centerId: centers[4].id,
    centerName: centers[4].name,
    mission: 'Set up field hospital at rescue base',
    priority: 'critical',
    status: 'pending',
    dispatchedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: null
  },
  {
    id: uuidv4(),
    volunteerId: volunteers[9].id,
    volunteerName: volunteers[9].name,
    centerId: centers[2].id,
    centerName: centers[2].name,
    mission: 'Water rescue operations in flooded zones',
    priority: 'critical',
    status: 'in-transit',
    dispatchedAt: new Date(Date.now() - 5400000).toISOString(),
    completedAt: null
  },
  {
    id: uuidv4(),
    volunteerId: volunteers[0].id,
    volunteerName: volunteers[0].name,
    centerId: centers[3].id,
    centerName: centers[3].name,
    mission: 'Distribute food packets in relief camp',
    priority: 'medium',
    status: 'completed',
    dispatchedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 43200000).toISOString()
  },
];

module.exports = { centers, inventory, volunteers, dispatches };
