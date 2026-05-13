import './StatsCards.css';

export default function StatsCards({ centers, inventory, volunteers, dispatches }) {
  const totalCenters = centers.length;
  const activeCenters = centers.filter(c => c.status === 'active').length;
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const activeVolunteers = volunteers.filter(v => v.status === 'available').length;
  const pendingDispatches = dispatches.filter(d => d.status !== 'completed').length;

  const cards = [
    {
      id: 'stat-centers',
      label: 'Relief Centers',
      value: totalCenters,
      sub: `${activeCenters} active`,
      icon: '🏥',
      color: 'teal',
    },
    {
      id: 'stat-inventory',
      label: 'Total Inventory',
      value: totalItems.toLocaleString(),
      sub: `${inventory.length} item types`,
      icon: '📦',
      color: 'blue',
    },
    {
      id: 'stat-volunteers',
      label: 'Volunteers',
      value: volunteers.length,
      sub: `${activeVolunteers} available`,
      icon: '👥',
      color: 'purple',
    },
    {
      id: 'stat-dispatches',
      label: 'Active Dispatches',
      value: pendingDispatches,
      sub: `${dispatches.length} total`,
      icon: '🚀',
      color: 'amber',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`stat-card stat-card--${card.color} glass-card animate-in animate-in-${i + 1}`}
          id={card.id}
        >
          <div className="stat-card__header">
            <span className="stat-card__icon">{card.icon}</span>
            <span className="stat-card__label">{card.label}</span>
          </div>
          <div className="stat-card__value">{card.value}</div>
          <div className="stat-card__sub">{card.sub}</div>
          <div className={`stat-card__glow stat-card__glow--${card.color}`} />
        </div>
      ))}
    </div>
  );
}
