import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  noPadding?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  hoverEffect = false,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-banorte-white rounded-card shadow-card border border-gray-100
        ${hoverEffect ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-hover cursor-pointer' : ''}
        ${noPadding ? '' : 'p-5'}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <h3 className={`text-xl font-bold text-banorte-dark ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`mt-4 pt-4 border-t ${className}`}>{children}</div>;
};
