
import React from 'react';
import { cn } from '@/lib/utils';
import { spacing, type SpacingToken } from '@/design/tokens';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number | 'auto-fit' | 'auto-fill';
  gap?: SpacingToken;
  minItemWidth?: string;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const Grid: React.FC<GridProps> = ({
  children,
  className,
  columns = 1,
  gap = 'lg',
  minItemWidth = '200px',
  responsive,
  style,
  ...props
}) => {
  const getGridTemplateColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    if (columns === 'auto-fit' || columns === 'auto-fill') {
      return `repeat(${columns}, minmax(${minItemWidth}, 1fr))`;
    }
    return 'repeat(1, 1fr)';
  };

  const responsiveClasses = responsive ? {
    [`grid-cols-${responsive.sm || 1}`]: true,
    [`md:grid-cols-${responsive.md || responsive.sm || 1}`]: responsive.md,
    [`lg:grid-cols-${responsive.lg || responsive.md || responsive.sm || 1}`]: responsive.lg,
    [`xl:grid-cols-${responsive.xl || responsive.lg || responsive.md || responsive.sm || 1}`]: responsive.xl,
  } : {};

  return (
    <div
      className={cn(
        'grid',
        !responsive && 'grid-cols-1',
        Object.keys(responsiveClasses).filter(key => responsiveClasses[key]),
        className
      )}
      style={{
        gap: spacing[gap],
        gridTemplateColumns: !responsive ? getGridTemplateColumns() : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
