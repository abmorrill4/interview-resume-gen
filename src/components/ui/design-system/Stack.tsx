
import React from 'react';
import { cn } from '@/lib/utils';
import { spacing, type SpacingToken } from '@/design/tokens';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: SpacingToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  children,
  className,
  direction = 'column',
  gap = 'lg',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  style,
  ...props
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className
      )}
      style={{
        gap: spacing[gap],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
