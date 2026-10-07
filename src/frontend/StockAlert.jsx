// src/components/StockAlert.jsx
import clsx from 'clsx';

export default function StockAlert({ name, stock, status }) {
  const statusStyles = {
    good:    { bar: "bg-green-500",   text: "text-green-400", bg: "bg-green-500/30", border: "border-green-600/40" },
    warning: { bar: "bg-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500/30", border: "border-yellow-600/40" },
    danger:  { bar: "bg-red-500",    text: "text-red-400",    bg: "bg-red-500/30",    border: "border-red-600/40" },
  };

  const style = statusStyles[status] || statusStyles.warning;

  const widthPercent = Math.min(100, Math.max(5, stock / 3)); // visual approximation

  return (
    <div className={clsx(
      "rounded-lg border p-3.5 flex flex-col gap-2",
      style.bg,
      style.border
    )}>
      <div className="flex justify-between items-center text-sm font-medium">
        <span>{name}</span>
        <span>{stock} left</span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={clsx("h-full transition-all", style.bar)}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}