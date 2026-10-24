// src/frontend/analytics/DemandHeatmap.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { getAnalyticsDemandHeatmap } from '../../api';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatHourLabel(hour) {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function formatHourRange(hour) {
  const start = formatHourLabel(hour);
  const nextHour = (hour + 1) % 24;
  const end = formatHourLabel(nextHour);
  return `${start} – ${end}`;
}

export default function DemandHeatmap({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsDemandHeatmap(range);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load heatmap');
      }
    } catch (err) {
      setError(err.message || 'Error fetching demand heatmap');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [range]);

  const maxCount = data?.maxCount || 1;
  const matrix = data?.matrix || [];

  // Function to calculate color intensity for each cell
  function getCellColor(count) {
    if (!count || count === 0) return '#1f1f1f';
    const ratio = Math.min(1, Math.max(0.18, count / maxCount));
    // Interpolate from deep amber/orange
    return `rgba(234, 88, 12, ${ratio.toFixed(2)})`;
  }

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <h3 className="analytics-card-title">
            <Calendar size={18} className="icon-orange" /> Order Demand Heatmap
          </h3>
          <div className="analytics-card-subtitle">
            Order concentration by day of week &amp; time of day (Asia/Colombo timezone)
          </div>
        </div>

        {data && (
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Total Orders in Matrix: <strong style={{ color: '#ea580c' }}>{data.totalOrders}</strong>
          </div>
        )}
      </div>

      {loading ? (
        <div className="analytics-skeleton-card" style={{ height: '240px' }} />
      ) : error ? (
        <div className="analytics-error-box">
          <AlertCircle size={24} />
          <h4>Failed to load heatmap</h4>
          <p>{error}</p>
          <button className="analytics-retry-btn" onClick={loadData}>
            <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
          </button>
        </div>
      ) : matrix.length === 0 ? (
        <div className="analytics-empty-box">
          <h4>No demand data</h4>
          <p>Not enough data yet to render order frequency heatmap.</p>
        </div>
      ) : (
        <div className="heatmap-scroll-wrap">
          <div className="heatmap-table">
            {/* Top Hour Labels Header Row */}
            <div className="heatmap-col-header" />
            {HOURS.map((h) => (
              <div key={`h-label-${h}`} className="heatmap-col-header">
                {h % 3 === 0 ? formatHourLabel(h) : ''}
              </div>
            ))}

            {/* 7 Days Matrix Rows */}
            {DAYS.map((dayName, wIndex) => {
              const dayData = matrix.find((m) => m.weekday === wIndex) || { hours: [] };

              return (
                <React.Fragment key={`row-${dayName}`}>
                  <div className="heatmap-row-header">{dayName}</div>
                  {HOURS.map((h) => {
                    const cell = dayData.hours.find((hr) => hr.hour === h) || { count: 0 };
                    const isHovered =
                      hoveredCell && hoveredCell.weekday === wIndex && hoveredCell.hour === h;

                    return (
                      <div
                        key={`cell-${wIndex}-${h}`}
                        className="heatmap-cell"
                        style={{
                          backgroundColor: getCellColor(cell.count),
                          border: cell.count > 0 ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(255, 255, 255, 0.03)',
                        }}
                        onMouseEnter={() =>
                          setHoveredCell({
                            weekday: wIndex,
                            dayName,
                            hour: h,
                            count: cell.count,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${dayName} at ${formatHourRange(h)}: ${cell.count} order(s)`}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          {/* Active Hover Detail or Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', minHeight: '20px' }}>
              {hoveredCell ? (
                <span style={{ color: '#f3f4f6' }}>
                  <strong style={{ color: '#ea580c' }}>{hoveredCell.dayName}</strong> ({formatHourRange(hoveredCell.hour)}):{' '}
                  <strong style={{ color: '#ffffff' }}>{hoveredCell.count}</strong> order{hoveredCell.count !== 1 ? 's' : ''}
                </span>
              ) : (
                <span style={{ color: '#6b7280' }}>Hover over any cell to inspect peak order volume</span>
              )}
            </div>

            {/* Legend */}
            <div className="heatmap-legend">
              <span>0</span>
              <div className="heatmap-legend-scale">
                <div className="heatmap-legend-box" style={{ backgroundColor: '#1f1f1f', border: '1px solid rgba(255, 255, 255, 0.05)' }} />
                <div className="heatmap-legend-box" style={{ backgroundColor: 'rgba(234, 88, 12, 0.3)' }} />
                <div className="heatmap-legend-box" style={{ backgroundColor: 'rgba(234, 88, 12, 0.6)' }} />
                <div className="heatmap-legend-box" style={{ backgroundColor: 'rgba(234, 88, 12, 1.0)' }} />
              </div>
              <span>{maxCount} orders</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
