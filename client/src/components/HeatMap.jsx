import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getCenters } from '../api/api';
import './HeatMap.css';

// Simple heat overlay using canvas — avoids extra plugin dependency
function HeatOverlay({ centers }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!map || centers.length === 0) return;

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    canvas.style.opacity = '0.5';

    const pane = map.getPane('overlayPane');
    pane.appendChild(canvas);

    const draw = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      centers.forEach(center => {
        if (center.status === 'closed') return;
        const point = map.latLngToContainerPoint([center.location.lat, center.location.lng]);
        const intensity = center.currentLoad / center.capacity;
        const radius = 40 + intensity * 60;

        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);

        if (intensity > 0.8) {
          gradient.addColorStop(0, 'rgba(255, 107, 107, 0.7)');
          gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        } else if (intensity > 0.5) {
          gradient.addColorStop(0, 'rgba(255, 179, 71, 0.6)');
          gradient.addColorStop(0.5, 'rgba(255, 179, 71, 0.25)');
          gradient.addColorStop(1, 'rgba(255, 179, 71, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(0, 212, 170, 0.5)');
          gradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 212, 170, 0)');
        }

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    draw();
    map.on('moveend zoomend', draw);

    return () => {
      map.off('moveend zoomend', draw);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, centers]);

  return null;
}

export default function HeatMap() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCenters() {
      try {
        const res = await getCenters();
        setCenters(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCenters();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><span>Loading map...</span></div>;
  }
  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  const getMarkerColor = (center) => {
    if (center.status === 'closed') return '#64748b';
    const ratio = center.currentLoad / center.capacity;
    if (ratio > 0.8) return '#ff6b6b';
    if (ratio > 0.5) return '#ffb347';
    return '#00d4aa';
  };

  return (
    <div className="panel" id="heatmap-view">
      <div className="panel__header">
        <div>
          <h1 className="panel__title">🗺️ Critical Zones Heat Map</h1>
          <p className="panel__subtitle">Heat intensity reflects center load vs. capacity</p>
        </div>
        <div className="heatmap-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#00d4aa' }} />
            <span>&lt; 50% Load</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ffb347' }} />
            <span>50-80% Load</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ff6b6b' }} />
            <span>&gt; 80% Load</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#64748b' }} />
            <span>Closed</span>
          </div>
        </div>
      </div>

      <div className="heatmap-container glass-card">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%', borderRadius: '16px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <HeatOverlay centers={centers} />
          {centers.map(center => (
            <CircleMarker
              key={center.id}
              center={[center.location.lat, center.location.lng]}
              radius={10}
              pathOptions={{
                fillColor: getMarkerColor(center),
                fillOpacity: 0.9,
                color: getMarkerColor(center),
                weight: 2,
                opacity: 0.6
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{center.name}</strong>
                  <p>{center.address}</p>
                  <p>Status: <span style={{ color: getMarkerColor(center), fontWeight: 600 }}>{center.status.toUpperCase()}</span></p>
                  <p>Load: {center.currentLoad} / {center.capacity}
                    ({Math.round((center.currentLoad / center.capacity) * 100)}%)
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
