
import React from 'react';
import { cn } from '@/lib/utils';
import { spacing, type SpacingToken } from '@/design/tokens';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: SpacingToken;
  margin?: SpacingToken;
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = '7xl',
  padding = 'lg',
  margin,
  center = true,
  ...props
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        className
      )}
      style={{
        padding: spacing[padding],
        margin: margin ? spacing[margin] : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
