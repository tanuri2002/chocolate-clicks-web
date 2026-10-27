// src/frontend/analytics/AnalyticsSection.jsx
import React, { useState } from 'react';
import AnalyticsKPIs from './AnalyticsKPIs';
import SalesTrendChart from './SalesTrendChart';
import TopProductsCharts from './TopProductsCharts';
// import DemandHeatmap from './DemandHeatmap';
import CustomerAnalytics from './CustomerAnalytics';
import './Analytics.css';

const RANGE_OPTIONS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' },
];

/**
 * AnalyticsSection:
 * Embedded inside the existing Admin Dashboard Overview tab below Order & Customer summaries.
 * Manages the global date range state and orchestrates all analytical sub-widgets.
 */
export default function AnalyticsSection() {
  const [range, setRange] = useState('30d');

  return (
    <section className="analytics-container" aria-labelledby="analytics-section-title">
      {/* Analytics Section Header with Date Range Selector */}
      <div className="analytics-header-row">
        <div className="analytics-title-wrap">
          <h2 id="analytics-section-title" className="section-title">
            Analytics
          </h2>
        </div>

        {/* Global Date Range Selector */}
        <div className="analytics-range-selector" role="tablist" aria-label="Select analytics date range">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`range-pill-btn ${range === opt.value ? 'active' : ''}`}
              onClick={() => setRange(opt.value)}
              role="tab"
              aria-selected={range === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Summary KPI Cards (Revenue, Orders, AOV vs previous period) */}
      <AnalyticsKPIs range={range} />

      {/* 2. Sales Trend & 7-Day Forecast */}
      <SalesTrendChart range={range} />

      {/* 3. Top Products & Category Revenue Distribution */}
      <TopProductsCharts range={range} />

      {/* 4. Demand Heatmap by Weekday & Hour (Commented out) */}
      {/* <DemandHeatmap range={range} /> */}

      {/* 5. Customer Analytics (New vs Active, Repeat Rate, Segments) */}
      <CustomerAnalytics range={range} />
    </section>
  );
}
