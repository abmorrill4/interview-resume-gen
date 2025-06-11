
import React from 'react';
import { cn } from '@/lib/utils';
import { borderRadius, spacing, type BorderRadiusToken, type SizeToken } from '@/design/tokens';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: SizeToken;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  radius?: BorderRadiusToken;
  'aria-label': string; // Required for accessibility
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  className,
  size = 'md',
  variant = 'default',
  radius = 'md',
  style,
  ...props
}) => {
  const sizeConfig = {
    xs: { padding: spacing.sm, iconSize: 12 },
    sm: { padding: spacing.md, iconSize: 14 },
    md: { padding: spacing.lg, iconSize: 16 },
    lg: { padding: spacing.xl, iconSize: 20 },
    xl: { padding: spacing['2xl'], iconSize: 24 },
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  };

  const config = sizeConfig[size];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        className
      )}
      style={{
        padding: config.padding,
        borderRadius: borderRadius[radius],
        ...style,
      }}
      {...props}
    >
      <Icon size={config.iconSize} />
    </button>
  );
};
