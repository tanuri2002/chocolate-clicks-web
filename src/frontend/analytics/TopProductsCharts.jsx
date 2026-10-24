// src/frontend/analytics/TopProductsCharts.jsx
import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Award, PieChart as PieIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { getAnalyticsTopProducts } from '../../api';
import { formatLKR } from '../DashboardOverview';

const CATEGORY_COLORS = [
  '#ea580c', // Orange
  '#c98b3b', // Amber / Gold
  '#10b981', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6b7280', // Gray fallback
];

export default function TopProductsCharts({ range }) {
  const [data, setData] = useState({ topProducts: [], categoryDistribution: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsTopProducts(range, 5);
      if (res.success) {
        setData({
          topProducts: res.topProducts || [],
          categoryDistribution: res.categoryDistribution || [],
        });
      } else {
        setError(res.message || 'Failed to load product analytics');
      }
    } catch (err) {
      setError(err.message || 'Error fetching top products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [range]);

  const { topProducts, categoryDistribution } = data;

  return (
    <div className="analytics-two-col">
      {/* 1. Best Sellers Bar Chart */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3 className="analytics-card-title">
              <Award size={18} className="icon-orange" /> Top Products by Volume
            </h3>
            <div className="analytics-card-subtitle">
              Most ordered items in the selected period
            </div>
          </div>
        </div>

        {loading ? (
          <div className="analytics-skeleton-card" style={{ height: '280px' }} />
        ) : error ? (
          <div className="analytics-error-box">
            <AlertCircle size={24} />
            <h4>Failed to load products</h4>
            <p>{error}</p>
            <button className="analytics-retry-btn" onClick={loadData}>
              <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
            </button>
          </div>
        ) : topProducts.length === 0 ? (
          <div className="analytics-empty-box">
            <h4>No product sales</h4>
            <p>No product orders found in this period.</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  width={110}
                  tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 14)}…` : val)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="custom-chart-tooltip">
                        <div className="tooltip-date">{item.name}</div>
                        <div>Quantity Sold: <strong>{item.quantity} units</strong></div>
                        <div style={{ color: '#ea580c', marginTop: '2px' }}>
                          Revenue: <strong>{formatLKR(item.revenue)}</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="quantity" fill="#ea580c" radius={[0, 4, 4, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Category Distribution Donut Chart */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3 className="analytics-card-title">
              <PieIcon size={18} className="icon-orange" /> Revenue by Category
            </h3>
            <div className="analytics-card-subtitle">
              Category revenue share from completed orders
            </div>
          </div>
        </div>

        {loading ? (
          <div className="analytics-skeleton-card" style={{ height: '280px' }} />
        ) : error ? (
          <div className="analytics-error-box">
            <AlertCircle size={24} />
            <h4>Failed to load categories</h4>
            <p>{error}</p>
            <button className="analytics-retry-btn" onClick={loadData}>
              <RefreshCw size={13} style={{ marginRight: '4px' }} /> Retry
            </button>
          </div>
        ) : categoryDistribution.length === 0 ? (
          <div className="analytics-empty-box">
            <h4>No category data</h4>
            <p>No category revenue data in this period.</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      stroke="#1a1a1a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="custom-chart-tooltip">
                        <div className="tooltip-date">{item.category}</div>
                        <div>Revenue: <strong style={{ color: '#ea580c' }}>{formatLKR(item.revenue)}</strong></div>
                        <div style={{ color: '#9ca3af' }}>Items Sold: <strong>{item.quantity}</strong></div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
