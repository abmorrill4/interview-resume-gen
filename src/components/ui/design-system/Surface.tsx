
import React from 'react';
import { cn } from '@/lib/utils';
import { borderRadius, shadows, spacing, type BorderRadiusToken, type ShadowToken, type SpacingToken } from '@/design/tokens';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: SpacingToken;
  radius?: BorderRadiusToken;
  shadow?: ShadowToken;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  interactive?: boolean;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  className,
  padding = 'lg',
  radius = 'lg',
  shadow = 'sm',
  variant = 'default',
  interactive = false,
  style,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground border',
    elevated: 'bg-card text-card-foreground',
    outlined: 'bg-transparent border-2 border-border',
    ghost: 'bg-transparent',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        interactive && 'transition-all duration-300 hover:scale-[1.02] cursor-pointer',
        className
      )}
      style={{
        padding: spacing[padding],
        borderRadius: borderRadius[radius],
        boxShadow: variant === 'elevated' || variant === 'default' ? shadows[shadow] : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
