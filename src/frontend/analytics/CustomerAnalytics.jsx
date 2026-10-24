// src/frontend/analytics/CustomerAnalytics.jsx
import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Users, UserCheck, Repeat, AlertCircle, RefreshCw } from 'lucide-react';
import { getAnalyticsCustomers } from '../../api';

export default function CustomerAnalytics({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsCustomers(range);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load customer analytics');
      }
    } catch (err) {
      setError(err.message || 'Error fetching customer analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [range]);

  const trend = data?.trend || [];
  const segments = data?.segments || {
    total: 0,
    new: { count: 0, percentage: 0 },
    returning: { count: 0, percentage: 0 },
    inactive: { count: 0, percentage: 0 },
  };
  const repeatRate = data?.repeatRate || 0;
  const repeatCustomers = data?.repeatCustomers || 0;
  const totalDistinct = data?.totalDistinctCustomers || 0;

  return (
    <div className="analytics-two-col">
      {/* 1. New Registrations vs Active Buyers Trend */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3 className="analytics-card-title">
              <Users size={18} className="icon-orange" /> New vs. Active Customers
            </h3>
            <div className="analytics-card-subtitle">
              Daily registrations compared with buyers placing orders
            </div>
          </div>
        </div>

        {loading ? (
          <div className="analytics-skeleton-card" style={{ height: '280px' }} />
        ) : error ? (
          <div className="analytics-error-box">
            <AlertCircle size={24} />
            <h4>Failed to load customer trend</h4>
            <p>{error}</p>
            <button className="analytics-retry-btn" onClick={loadData}>
              <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
            </button>
          </div>
        ) : trend.length === 0 ? (
          <div className="analytics-empty-box">
            <h4>No customer activity</h4>
            <p>No registration or order activity in this period.</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (!val) return '';
                    if (val.length === 10) return val.slice(5);
                    return val;
                  }}
                />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="custom-chart-tooltip">
                        <div className="tooltip-date">{label}</div>
                        <div style={{ color: '#10b981' }}>
                          Active Buyers: <strong>{item.activeCustomers}</strong>
                        </div>
                        <div style={{ color: '#3b82f6', marginTop: '2px' }}>
                          New Signups: <strong>{item.newRegistrations}</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={30}
                  formatter={(val) => <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{val}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="activeCustomers"
                  name="Active Buyers"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#activeFill)"
                />
                <Line
                  type="monotone"
                  dataKey="newRegistrations"
                  name="New Signups"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Customer Retention & Segments */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3 className="analytics-card-title">
              <UserCheck size={18} className="icon-orange" /> Retention &amp; Customer Segments
            </h3>
            <div className="analytics-card-subtitle">
              Customer loyalty repeat rate and active/inactive breakdown
            </div>
          </div>
        </div>

        {loading ? (
          <div className="analytics-skeleton-card" style={{ height: '280px' }} />
        ) : error ? (
          <div className="analytics-error-box">
            <AlertCircle size={24} />
            <h4>Failed to load segments</h4>
            <p>{error}</p>
            <button className="analytics-retry-btn" onClick={loadData}>
              <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', justifyContent: 'space-between' }}>
            {/* Repeat Rate Banner */}
            <div className="repeat-rate-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#e5e7eb', fontWeight: '600' }}>
                  Repeat Purchase Rate
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                  {repeatCustomers} of {totalDistinct} buyers ordered 2+ times
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="repeat-rate-number">{repeatRate}%</span>
                <Repeat size={18} color="#ea580c" />
              </div>
            </div>

            {/* Segments Visual Proportion Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>Account Segmentation ({segments.total} users)</span>
                <span>Loyalty Mix</span>
              </div>

              <div className="segment-bar-container">
                <div
                  className="segment-bar-fill"
                  style={{
                    width: `${segments.returning.percentage}%`,
                    backgroundColor: '#ea580c',
                  }}
                  title={`Returning: ${segments.returning.count} (${segments.returning.percentage}%)`}
                />
                <div
                  className="segment-bar-fill"
                  style={{
                    width: `${segments.new.percentage}%`,
                    backgroundColor: '#10b981',
                  }}
                  title={`New (1 Order): ${segments.new.count} (${segments.new.percentage}%)`}
                />
                <div
                  className="segment-bar-fill"
                  style={{
                    width: `${segments.inactive.percentage}%`,
                    backgroundColor: '#4b5563',
                  }}
                  title={`Inactive (>30d or 0 orders): ${segments.inactive.count} (${segments.inactive.percentage}%)`}
                />
              </div>

              {/* Segment Cards Legend */}
              <div className="segment-legend-grid">
                <div className="segment-legend-item">
                  <div className="segment-legend-header">
                    <span className="segment-color-dot" style={{ backgroundColor: '#ea580c' }} />
                    <span>Returning (2+)</span>
                  </div>
                  <div className="segment-count-val">{segments.returning.count}</div>
                  <div className="segment-pct-val">{segments.returning.percentage}% of total</div>
                </div>

                <div className="segment-legend-item">
                  <div className="segment-legend-header">
                    <span className="segment-color-dot" style={{ backgroundColor: '#10b981' }} />
                    <span>New (1 Order)</span>
                  </div>
                  <div className="segment-count-val">{segments.new.count}</div>
                  <div className="segment-pct-val">{segments.new.percentage}% of total</div>
                </div>

                <div className="segment-legend-item">
                  <div className="segment-legend-header">
                    <span className="segment-color-dot" style={{ backgroundColor: '#4b5563' }} />
                    <span>Inactive (&gt;30d)</span>
                  </div>
                  <div className="segment-count-val">{segments.inactive.count}</div>
                  <div className="segment-pct-val">{segments.inactive.percentage}% of total</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
