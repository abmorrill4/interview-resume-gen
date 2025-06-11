
import React from 'react';
import { cn } from '@/lib/utils';
import { typography, type FontSizeToken, type FontWeightToken } from '@/design/tokens';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: FontSizeToken;
  weight?: FontWeightToken;
  variant?: 'default' | 'muted' | 'accent' | 'gradient';
  align?: 'left' | 'center' | 'right' | 'justify';
  family?: 'sans' | 'display' | 'mono';
}

export const Text: React.FC<TextProps> = ({
  children,
  className,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  variant = 'default',
  align = 'left',
  family = 'sans',
  style,
  ...props
}) => {
  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-primary',
    gradient: 'text-gradient',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const familyClasses = {
    sans: 'font-sans',
    display: 'font-display',
    mono: 'font-mono',
  };

  const fontSizeValue = typography.fontSize[size];
  const fontSize = Array.isArray(fontSizeValue) ? fontSizeValue[0] : fontSizeValue;
  const lineHeight = Array.isArray(fontSizeValue) ? fontSizeValue[1]?.lineHeight : undefined;

  return (
    <Component
      className={cn(
        variantClasses[variant],
        alignClasses[align],
        familyClasses[family],
        className
      )}
      style={{
        fontSize,
        lineHeight,
        fontWeight: typography.fontWeight[weight],
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};
