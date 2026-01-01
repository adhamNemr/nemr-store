import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
}

export default function StatCard({ label, value, unit, icon, trend }: StatCardProps) {
  return (
    <div className="dashboard-card stat-card border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-dark fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>
          {label}
        </span>
        <div className="icon-box bg-light text-dark rounded p-2">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <h3 className="fw-bold mb-0 text-dark">
        {typeof value === 'number' ? value.toLocaleString() : value} 
        {unit && <span className="fs-6 text-muted ms-1">{unit}</span>}
      </h3>
      {trend && (
        <div className="mt-2">
          <span className={`small fw-bold ${trend.isUp ? 'text-success' : 'text-danger'}`}>
            {trend.isUp ? '+' : '-'}{trend.value}%
          </span>
          <span className="text-muted small ms-1">vs last month</span>
        </div>
      )}
    </div>
  );
}
