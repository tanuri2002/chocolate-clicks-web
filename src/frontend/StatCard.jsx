// src/components/StatCard.jsx
import clsx from 'clsx';

export default function StatCard({ icon: Icon, title, value, change, positive = true }) {
  return (
    <div className="bg-dark-800 rounded-xl p-5 border border-dark-700/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-dark-700 rounded-lg">
            <Icon size={20} className="text-orange-500" />
          </div>
          <span className="text-sm text-gray-400">{title}</span>
        </div>
        <div className={clsx(
          "text-xs font-medium px-2.5 py-1 rounded-full",
          positive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        )}>
          {change > 0 ? "+" : ""}{change}%
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}