import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 border rounded-input transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-banorte-red';
  const errorStyles = error
    ? 'border-status-alert focus:ring-status-alert'
    : 'border-gray-300 focus:border-banorte-red';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-banorte-dark mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`${baseStyles} ${errorStyles} ${widthStyle} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-status-alert">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-banorte-gray">{helperText}</p>
      )}
    </div>
  );
};
