import React from 'react';
import { cn } from '../../utils/cn';
import type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
} from './Card.types';

export function Card({
  children,
  className,
  onClick,
  hoverEffect = false,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-banorte-white rounded-card shadow-card border border-gray-100',
        hoverEffect &&
          'transition-transform duration-300 hover:-translate-y-1 hover:shadow-hover cursor-pointer',
        !noPadding && 'p-5',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-xl font-bold text-banorte-dark', className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return <div className={cn('mt-4 pt-4 border-t', className)}>{children}</div>;
};
