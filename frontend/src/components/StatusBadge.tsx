import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    approved: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    rejected: 'bg-red-100 text-red-800 border border-red-300',
  };

  const labels = {
    pending: '⏳ Pending',
    approved: '✅ Approved',
    rejected: '❌ Rejected',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
