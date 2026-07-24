import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  circle = false,
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${
        circle ? 'rounded-full' : 'rounded'
      } ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
};
