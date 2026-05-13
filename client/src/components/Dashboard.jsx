import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import StatsCards from './StatsCards';
import { getCenters, getInventory, getVolunteers, getDispatches } from '../api/api';
import './Dashboard.css';

const COLORS = {
  food: '#00d4aa',
  medical: '#ff6b6b',
  shelter: '#ffb347',
  water: '#6c9fff',
  clothing: '#a78bfa'
};

const PIE_COLORS = ['#00d4aa', '#ffb347', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip__value" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [centers, setCenters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [c, inv, vol, dis] = await Promise.all([
          getCenters(),
          getInventory(),
          getVolunteers(),
          getDispatches()
        ]);
        setCenters(c.data);
        setInventory(inv.data);
        setVolunteers(vol.data);
        setDispatches(dis.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  // ── Chart Data ──
  // Inventory by category
  const categoryData = Object.entries(
    inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {})
  ).map(([name, total]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    total,
    fill: COLORS[name] || '#6c9fff'
  }));

  // Volunteer status breakdown
  const volStatusData = [
    { name: 'Available', value: volunteers.filter(v => v.status === 'available').length },
    { name: 'Dispatched', value: volunteers.filter(v => v.status === 'dispatched').length },
    { name: 'Off-Duty', value: volunteers.filter(v => v.status === 'off-duty').length },
  ].filter(d => d.value > 0);

  // Center load data
  const centerLoadData = centers
    .filter(c => c.status !== 'closed')
    .map(c => ({
      name: c.name.split(' ').slice(0, 2).join(' '),
      load: c.currentLoad,
      capacity: c.capacity,
      utilization: Math.round((c.currentLoad / c.capacity) * 100)
    }));

  return (
    <div className="dashboard" id="dashboard-view">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Command Center</h1>
          <p className="dashboard__subtitle">Real-time disaster relief operations overview</p>
        </div>
        <div className="dashboard__timestamp">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <StatsCards
        centers={centers}
        inventory={inventory}
        volunteers={volunteers}
        dispatches={dispatches}
      />

      <div className="dashboard__charts">
        {/* Inventory by Category */}
        <div className="chart-card glass-card animate-in animate-in-3" id="chart-inventory">
          <h3 className="chart-card__title">📦 Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Quantity" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Volunteer Status */}
        <div className="chart-card glass-card animate-in animate-in-4" id="chart-volunteers">
          <h3 className="chart-card__title">👥 Volunteer Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={volStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {volStatusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center Utilization */}
        <div className="chart-card chart-card--wide glass-card animate-in animate-in-5" id="chart-centers">
          <h3 className="chart-card__title">🏥 Center Utilization (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={centerLoadData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="utilization"
                name="Utilization %"
                stroke="#00d4aa"
                strokeWidth={2}
                fill="url(#colorUtil)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
