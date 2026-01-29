import React from 'react';
import { cn } from '../../utils/cn';
import type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from './Table.types';

export function Table({ children, className, ...props }: TableProps) {
  return (
    <table
      className={cn('w-full text-sm', className)}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHeader({ children, sticky = false, className, ...props }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        'bg-[#F4F7F8]',
        sticky && 'sticky top-0 z-10',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={cn(className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, selected = false, hoverable = true, className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-t border-gray-100 transition-colors',
        hoverable && 'hover:bg-[#F4F7F8] cursor-pointer',
        selected && 'bg-blue-50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function TableHead({ children, align = 'left', className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 font-semibold text-[#323E48] text-sm',
        'font-[Gotham,Montserrat,sans-serif]',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, align = 'left', className, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}
