import type React from 'react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}
