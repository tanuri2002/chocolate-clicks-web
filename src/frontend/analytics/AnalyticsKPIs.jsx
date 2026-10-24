// src/frontend/analytics/AnalyticsKPIs.jsx
import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { getAnalyticsSummary } from '../../api';
import { formatLKR } from '../DashboardOverview';

export default function AnalyticsKPIs({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadKPIs() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsSummary(range);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load summary');
      }
    } catch (err) {
      setError(err.message || 'Error fetching analytics summary');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKPIs();
  }, [range]);

  if (loading) {
    return (
      <div className="analytics-kpi-grid">
        <div className="summary-card analytics-skeleton-card" style={{ minHeight: '120px' }} />
        <div className="summary-card analytics-skeleton-card" style={{ minHeight: '120px' }} />
        <div className="summary-card analytics-skeleton-card" style={{ minHeight: '120px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-card" style={{ padding: '1rem' }}>
        <div className="analytics-error-box" style={{ minHeight: '100px' }}>
          <AlertCircle size={20} />
          <p>{error}</p>
          <button className="analytics-retry-btn" onClick={loadKPIs}>
            <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { current, changes } = data || {
    current: { revenue: 0, orderCount: 0, avgOrderValue: 0 },
    changes: { revenueChange: 0, orderCountChange: 0, avgOrderValueChange: 0 },
  };

  function renderDelta(change) {
    if (range === 'all') {
      return (
        <span className="kpi-delta-badge neutral">
          <Minus size={11} /> All Time
        </span>
      );
    }
    const val = Number(change) || 0;
    if (val > 0) {
      return (
        <span className="kpi-delta-badge positive" title="Versus previous period of equal length">
          <TrendingUp size={11} /> +{val}% vs prev
        </span>
      );
    } else if (val < 0) {
      return (
        <span className="kpi-delta-badge negative" title="Versus previous period of equal length">
          <TrendingDown size={11} /> {val}% vs prev
        </span>
      );
    }
    return (
      <span className="kpi-delta-badge neutral">
        <Minus size={11} /> 0% vs prev
      </span>
    );
  }

  return (
    <div className="analytics-kpi-grid">
      {/* Revenue KPI */}
      <div className="summary-card">
        <div className="summary-icon icon-orange" style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
          <DollarSign size={24} />
        </div>
        <div className="summary-content">
          <div className="summary-label">Period Revenue</div>
          <div className="summary-value">{formatLKR(current.revenue)}</div>
          {renderDelta(changes.revenueChange)}
        </div>
      </div>

      {/* Orders KPI */}
      <div className="summary-card">
        <div className="summary-icon icon-blue" style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6' }}>
          <ShoppingBag size={24} />
        </div>
        <div className="summary-content">
          <div className="summary-label">Total Orders</div>
          <div className="summary-value">{current.orderCount}</div>
          {renderDelta(changes.orderCountChange)}
        </div>
      </div>

      {/* Average Order Value KPI */}
      <div className="summary-card">
        <div className="summary-icon icon-green" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <TrendingUp size={24} />
        </div>
        <div className="summary-content">
          <div className="summary-label">Average Order Value</div>
          <div className="summary-value">{formatLKR(current.avgOrderValue)}</div>
          {renderDelta(changes.avgOrderValueChange)}
        </div>
      </div>
    </div>
  );
}
