import React from 'react';
import StatsCard, { StatsCardProps } from './StatsCard';

export interface StatsGridProps {
  stats: StatsCardProps[];
  isLoading?: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard
          key={stat.title}
          {...stat}
          index={index}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

