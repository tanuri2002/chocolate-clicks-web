// src/frontend/analytics/SalesTrendChart.jsx
import React, { useEffect, useState, useMemo } from 'react';
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
import { TrendingUp, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { getAnalyticsSalesTrend, getAnalyticsForecast } from '../../api';
import { formatLKR } from '../DashboardOverview';

export default function SalesTrendChart({ range }) {
  const [granularity, setGranularity] = useState('day');
  const [trendData, setTrendData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set intelligent default granularity when range changes
  useEffect(() => {
    if (range === '90d') {
      setGranularity('week');
    } else if (range === 'all') {
      setGranularity('month');
    } else {
      setGranularity('day');
    }
  }, [range]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, forecastRes] = await Promise.allSettled([
        getAnalyticsSalesTrend(range, granularity),
        getAnalyticsForecast(),
      ]);

      if (trendRes.status === 'fulfilled' && trendRes.value.success) {
        setTrendData(trendRes.value.trend || []);
      } else {
        throw new Error(trendRes.reason?.message || 'Failed to fetch sales trend');
      }

      if (forecastRes.status === 'fulfilled') {
        setForecastData(forecastRes.value);
      }
    } catch (err) {
      setError(err.message || 'Error loading sales trend');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [range, granularity]);

  // Combine trend and forecast for continuous charting
  const chartData = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];

    const formattedHistory = trendData.map((d) => ({
      date: d.date,
      revenue: d.revenue,
      orderCount: d.orderCount,
      predictedRevenue: null,
      isEstimate: false,
    }));

    // Only attach 7-day forecast if we are in 'day' granularity and forecastData is valid
    if (
      granularity === 'day' &&
      forecastData &&
      !forecastData.insufficientData &&
      Array.isArray(forecastData.forecast) &&
      forecastData.forecast.length > 0
    ) {
      // Connect last history point to forecast line
      const lastPoint = formattedHistory[formattedHistory.length - 1];
      if (lastPoint) {
        lastPoint.predictedRevenue = lastPoint.revenue;
      }

      const formattedForecast = forecastData.forecast.map((f) => ({
        date: f.date,
        revenue: null,
        orderCount: null,
        predictedRevenue: f.predictedRevenue,
        isEstimate: true,
      }));

      return [...formattedHistory, ...formattedForecast];
    }

    return formattedHistory;
  }, [trendData, forecastData, granularity]);

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <h3 className="analytics-card-title">
            <TrendingUp size={18} className="icon-orange" /> Revenue Trend &amp; Projections
          </h3>
          <div className="analytics-card-subtitle">
            Historical revenue with optional 7-day moving-average forecast
          </div>
        </div>

        {/* Day / Week / Month Granularity Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {forecastData?.insufficientData === false && granularity === 'day' && (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#c98b3b',
                backgroundColor: 'rgba(201, 139, 59, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid rgba(201, 139, 59, 0.25)',
              }}
            >
              <Sparkles size={11} /> 7-Day Forecast Active
            </span>
          )}

          <div className="granularity-btn-group" role="tablist" aria-label="Chart granularity">
            <button
              type="button"
              className={`granularity-btn ${granularity === 'day' ? 'active' : ''}`}
              onClick={() => setGranularity('day')}
            >
              Day
            </button>
            <button
              type="button"
              className={`granularity-btn ${granularity === 'week' ? 'active' : ''}`}
              onClick={() => setGranularity('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`granularity-btn ${granularity === 'month' ? 'active' : ''}`}
              onClick={() => setGranularity('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="analytics-skeleton-card" style={{ height: '320px' }} />
      ) : error ? (
        <div className="analytics-error-box">
          <AlertCircle size={24} />
          <h4>Failed to load chart</h4>
          <p>{error}</p>
          <button className="analytics-retry-btn" onClick={loadData}>
            <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
          </button>
        </div>
      ) : chartData.length === 0 ? (
        <div className="analytics-empty-box">
          <h4>Not enough data yet</h4>
          <p>No orders recorded in the selected date range.</p>
        </div>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
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
                  if (val.length === 10) return val.slice(5); // MM-DD
                  return val;
                }}
              />

              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return val;
                }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload;
                  if (!item) return null;

                  return (
                    <div className="custom-chart-tooltip">
                      <div className="tooltip-date">
                        {label} {item.isEstimate ? ' (Forecast Estimate)' : ''}
                      </div>
                      {item.revenue !== null && item.revenue !== undefined && (
                        <div>
                          Revenue: <strong style={{ color: '#ea580c' }}>{formatLKR(item.revenue)}</strong>
                        </div>
                      )}
                      {item.orderCount !== null && item.orderCount !== undefined && (
                        <div style={{ color: '#9ca3af' }}>
                          Orders: <span style={{ color: '#f3f4f6' }}>{item.orderCount}</span>
                        </div>
                      )}
                      {item.predictedRevenue !== null && item.predictedRevenue !== undefined && item.isEstimate && (
                        <div style={{ color: '#f59e0b', marginTop: '2px' }}>
                          Predicted: <strong>{formatLKR(item.predictedRevenue)}</strong>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={30}
                iconType="plainline"
                formatter={(val) => <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{val}</span>}
              />

              {/* Historical Revenue Area */}
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (LKR)"
                stroke="#ea580c"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueFill)"
                connectNulls={false}
              />

              {/* 7-day Forecast Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="predictedRevenue"
                name="Forecast Projection"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#f59e0b' }}
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
