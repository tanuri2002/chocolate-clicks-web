// src/pages/Dashboard.jsx
import React from 'react';
import { TrendingUp, Users, Package, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../frontend/StatCard';
import StockAlert from '../frontend/StockAlert';
import './Dashboard.css';

// ─── Example data ────────────────────────────────────────────────
const monthlySales = [
  { month: 'Jan', sales: 38000, orders: 420 },
  { month: 'Feb', sales: 42000, orders: 480 },
  { month: 'Mar', sales: 38000, orders: 410 },
  { month: 'Apr', sales: 62000, orders: 680 },
  { month: 'May', sales: 58000, orders: 640 },
  { month: 'Jun', sales: 72000, orders: 790 },
  { month: 'Jul', sales: 68000, orders: 750 },
  { month: 'Aug', sales: 74000, orders: 810 },
  { month: 'Sep', sales: 78000, orders: 860 },
  { month: 'Oct', sales: 82000, orders: 900 },
  { month: 'Nov', sales: 98000, orders: 1080 },
  { month: 'Dec', sales: 135000, orders: 1480 },
];

const dailyActivity = [
  { day: 'Mon', new: 180, active: 1250 },
  { day: 'Tue', new: 210, active: 1420 },
  { day: 'Wed', new: 195, active: 1680 },
  { day: 'Thu', new: 230, active: 1750 },
  { day: 'Fri', new: 280, active: 1980 },
  { day: 'Sat', new: 340, active: 2150 },
  { day: 'Sun', new: 260, active: 1920 },
];

const stockAlerts = [
  { name: "Dark Chocolate Truffles", stock: 234, status: "good" },
  { name: "Milk Chocolate Bar", stock: 45, status: "warning" },
  { name: "White Chocolate Cookies", stock: 12, status: "danger" },
  { name: "Chocolate Bonbons", stock: 189, status: "good" },
  { name: "Cocoa Powder Premium", stock: 67, status: "warning" },
];

const recentOrders = [
  { id: "ORD-12847", customer: "Sarah Johnson",  product: "Dark Chocolate Truffles", amount: 89.99,  status: "Completed",  time: "2 mins ago"  },
  { id: "ORD-12846", customer: "Michael Chen",   product: "Chocolate Gift Box",       amount: 149.99, status: "Processing", time: "15 mins ago" },
  { id: "ORD-12845", customer: "Emma Williams",  product: "Milk Chocolate Bar",       amount: 24.99,  status: "Completed",  time: "1 hour ago"  },
  { id: "ORD-12844", customer: "David Martinez", product: "White Chocolate Cookies", amount: 34.99,  status: "Shipped",     time: "2 hours ago" },
  { id: "ORD-12843", customer: "Lisa Anderson",  product: "Chocolate Bonbons",       amount: 64.99,  status: "Cancelled",   time: "3 hours ago" },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <h1>Admin Dashboard</h1>
          <div className="dashboard-welcome">Welcome back! Here's your business overview.</div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* KPI cards */}
        <div className="kpi-cards">
          <StatCard icon={TrendingUp}  title="Total Sales"   value="$127,540" change={12.5}  positive />
          <StatCard icon={Users}       title="Active Users"  value="8,459"   change={8.2}   positive />
          <StatCard icon={Package}     title="Total Orders"  value="1,247"   change={15.3}  positive />
          <StatCard icon={Percent}     title="Conversion Rate" value="3.24%" change={-0.4} positive={false} />
        </div>

        {/* Charts */}
        <div className="dashboard-charts">
          {/* Sales Performance */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h2><TrendingUp size={18} className="icon-orange"/> Sales Performance</h2>
                <p>Monthly sales and order trends</p>
              </div>
              <div className="chart-toggle">
                <button>Line</button>
                <button>Bar</button>
              </div>
            </div>
            <div className="chart-area">
              <ResponsiveContainer>
                <AreaChart data={monthlySales}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/>
                  <XAxis dataKey="month" stroke="#666"/>
                  <YAxis stroke="#666"/>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '#333' }}/>
                  <Area type="monotone" dataKey="sales" stroke="#f59e0b" fill="url(#colorSales)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Activity */}
          <div className="chart-card">
            <h2 className="chart-title"><Users size={18} className="icon-orange"/> Customer Activity</h2>
            <div className="chart-area">
              <ResponsiveContainer>
                <AreaChart data={dailyActivity}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/>
                  <XAxis dataKey="day" stroke="#666"/>
                  <YAxis stroke="#666"/>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '#333' }}/>
                  <Area type="monotone" dataKey="active" stroke="#8b5cf6" fill="url(#colorActive)" name="Active Users"/>
                  <Area type="monotone" dataKey="new" stroke="#f59e0b" fill="url(#colorNew)" name="New Users" stackId="1"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="dashboard-bottom">
          {/* Stock Alerts & Promotions */}
          <div className="left-column">
            {/* Stock Alerts */}
            <div className="stock-card">
              <h2><Package size={18} className="icon-orange"/> Stock Alerts</h2>
              <div className="stock-list">
                {stockAlerts.map(item => (
                  <StockAlert key={item.name} {...item}/>
                ))}
              </div>
              <button className="restock-button">Restock Low Items</button>
            </div>

            {/* Active Promotions */}
            <div className="promotions-card">
              <h2>Active Promotions</h2>
              <div className="promotion-list">
                <div className="promotion-item">
                  <span>Holiday Special</span>
                  <span>+32% • Active</span>
                </div>
                <div className="promotion-item">
                  <span>Milk Sale</span>
                  <span>+18% • Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="recent-orders-card">
            <div className="recent-orders-header">
              <h2><Package size={18} className="icon-orange"/> Recent Orders</h2>
              <button>View All</button>
            </div>
            <div className="orders-list">
              {recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div>
                    <div className="order-title">{order.id} • {order.customer}</div>
                    <div className="order-product">{order.product}</div>
                  </div>
                  <div className="order-right">
                    <div className="order-amount">${order.amount.toFixed(2)}</div>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
