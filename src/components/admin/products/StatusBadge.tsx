import React from 'react';
import { OfflineProduct } from '@/types/product';

interface StatusBadgeProps {
  status: OfflineProduct['status'];
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  approved: {
    label: 'Approuvé',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  rejected: {
    label: 'Rejeté',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};