import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function AdminCard({ children, className = '', hover = true, glow = false }: AdminCardProps) {
  const baseClasses = 'admin-card p-6';
  const hoverClasses = hover ? ' hover:scale-105 hover:shadow-2xl' : '';
  const glowClasses = glow ? ' glow-border' : '';

  return (
    <div className={`${baseClasses}${hoverClasses}${glowClasses} ${className}`}>
      {children}
    </div>
  );
}