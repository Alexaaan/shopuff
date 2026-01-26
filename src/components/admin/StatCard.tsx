import React from 'react';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  className?: string;
}

export default function StatCard({ icon, value, label, color = 'from-purple-500 to-pink-500', className = '' }: StatCardProps) {
  return (
    <div className={`stat-card group relative overflow-hidden ${className}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`absolute inset-0 bg-gradient-to-br ${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`}></div>
    </div>
  );
}