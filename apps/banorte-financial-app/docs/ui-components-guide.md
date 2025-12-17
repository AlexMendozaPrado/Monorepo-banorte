# Budget Module - UI Components Guide

## Overview

This guide covers all the UI components created for the Budget Module, including their props, usage examples, and design patterns.

## Table of Contents

1. [Budget Components](#budget-components)
2. [Layout Components](#layout-components)
3. [Base UI Components](#base-ui-components)
4. [Usage Examples](#usage-examples)

---

## Budget Components

### 1. BudgetHeader

**Location:** `src/app/components/budget/BudgetHeader.tsx`

**Purpose:** Displays the budget page header with month navigation and add category button.

**Props:**
```typescript
interface BudgetHeaderProps {
  currentMonth: string;           // Formatted month string (e.g., "enero 2024")
  onMonthChange: (direction: 'prev' | 'next') => void;
  onAddCategory: () => void;
}
```

**Usage:**
```tsx
<BudgetHeader
  currentMonth="enero 2024"
  onMonthChange={(direction) => handleMonthChange(direction)}
  onAddCategory={() => setIsModalOpen(true)}
/>
```

---

### 2. BudgetSummary

**Location:** `src/app/components/budget/BudgetSummary.tsx`

**Purpose:** Displays three summary cards showing income, spent, and available amounts.

**Props:**
```typescript
interface BudgetSummaryProps {
  income: number;
  spent: number;
  available: number;
  currency?: string;  // Default: 'MXN'
}
```

**Features:**
- ✅ Color-coded cards (green for income, yellow/red for spent, red for available)
- ✅ Automatic percentage calculation
- ✅ Over-budget detection
- ✅ Currency formatting

**Usage:**
```tsx
<BudgetSummary
  income={30000}
  spent={15000}
  available={15000}
/>
```

---

### 3. CategoryCard

**Location:** `src/app/components/budget/CategoryCard.tsx`

**Purpose:** Displays individual budget category with progress bar and spending details.

**Props:**
```typescript
interface CategoryCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  spent: number;
  budget: number;
  trend?: 'up' | 'down' | 'stable';
  currency?: string;
  onEdit: (id: string) => void;
}
```

**Features:**
- ✅ Progress bar with color coding (green < 80%, yellow 80-100%, red > 100%)
- ✅ Trend indicators (up/down/stable)
- ✅ Over-budget and near-limit alerts
- ✅ Edit button with hover effects

**Usage:**
```tsx
<CategoryCard
  id="cat-1"
  name="Alimentos"
  icon={<span>🍔</span>}
  spent={4500}
  budget={6000}
  trend="stable"
  onEdit={(id) => handleEdit(id)}
/>
```

---

### 4. SmallExpensesAlert

**Location:** `src/app/components/budget/SmallExpensesAlert.tsx`

**Purpose:** Displays AI-powered ant expenses (gastos hormiga) detection and savings potential.

**Props:**
```typescript
interface SmallExpensesAlertProps {
  userId?: string;  // Default: 'user-demo'
}
```

**Features:**
- ✅ Automatically fetches ant expenses analysis using `useAntExpenses` hook
- ✅ Shows top detection with monthly and annual savings
- ✅ Displays AI-generated recommendations
- ✅ Only renders if detections exist

**Usage:**
```tsx
<SmallExpensesAlert userId="user-123" />
```

---

### 5. TopExpenses

**Location:** `src/app/components/budget/TopExpenses.tsx`

**Purpose:** Displays recent transactions with category badges and amounts.

**Props:**
```typescript
interface TopExpensesProps {
  transactions?: Transaction[];
  currency?: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  merchant?: string;
}
```

**Features:**
- ✅ Mock data fallback if no transactions provided
- ✅ Color-coded category badges
- ✅ Smart date formatting (Hoy, Ayer, or date)
- ✅ Hover effects on transaction items

**Usage:**
```tsx
<TopExpenses transactions={recentTransactions} />
```

---

### 6. CategoryModal

**Location:** `src/app/components/budget/CategoryModal.tsx`

**Purpose:** Modal for creating or editing budget categories.

**Props:**
```typescript
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;  // If provided, edit mode
  onSave?: (data: { name: string; budgeted: number; icon?: string; color?: string }) => void;
}
```

**Features:**
- ✅ Create and edit modes
- ✅ Form validation
- ✅ Predefined icon selector (10 emojis)
- ✅ Color picker (8 Banorte brand colors)
- ✅ Custom emoji input

**Usage:**
```tsx
<CategoryModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  category={selectedCategory}
  onSave={(data) => handleSave(data)}
/>
```

---

## Layout Components

### Sidebar

**Location:** `src/app/components/layout/Sidebar.tsx`

**Updates:**
- ✅ Added "Presupuestos" navigation item with Wallet icon
- ✅ Active tab highlighting
- ✅ Click handler for navigation

### Header

**Location:** `src/app/components/layout/Header.tsx`

**Features:**
- ✅ Search bar
- ✅ Notifications bell
- ✅ User menu

---

## Base UI Components

All base components are located in `src/app/components/ui/`:

1. **Button** - Primary, secondary, outline, ghost variants
2. **Card** - Container with header and content
3. **Input** - Text input with validation
4. **Modal** - Overlay modal with backdrop
5. **ProgressBar** - Color-coded progress indicator

---

## Usage Examples

### Complete Budget Page

```tsx
'use client';

import { useState } from 'react';
import { useBudget, useAntExpenses } from '@/app/hooks';
import {
  BudgetHeader,
  BudgetSummary,
  CategoryCard,
  SmallExpensesAlert,
  TopExpenses,
  CategoryModal
} from '@/app/components/budget';

export function BudgetPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const userId = 'user-123';
  const { budget, loading } = useBudget(userId, currentMonth);
  const { analysis } = useAntExpenses(userId);

  if (loading) return <div>Loading...</div>;
  if (!budget) return <div>No budget found</div>;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <BudgetHeader
        currentMonth={budget.month}
        onMonthChange={(dir) => {/* handle */}}
        onAddCategory={() => setIsModalOpen(true)}
      />

      <BudgetSummary
        income={budget.totalIncome.amount}
        spent={budget.totalSpent.amount}
        available={budget.available.amount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budget.categories.map(cat => (
              <CategoryCard key={cat.id} {...cat} onEdit={handleEdit} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SmallExpensesAlert userId={userId} />
          <TopExpenses />
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
```

---

## Design System

### Colors (Banorte Brand)

- **Primary Red:** `#EB0029` (banorte-red)
- **Dark Gray:** `#323E48` (banorte-dark)
- **Light Gray:** `#5B6670` (banorte-gray)
- **Success Green:** `#6CC04A` (status-success)
- **Warning Orange:** `#FFA400` (status-warning)
- **Alert Red:** `#E74C3C` (status-alert)

### Spacing

- Cards: `p-5` or `p-6`
- Gaps: `gap-4` or `gap-6`
- Max width: `max-w-[1440px]`

### Shadows

- Card: `shadow-card`
- Hover: `shadow-hover`

### Border Radius

- Card: `rounded-card`
- Button: `rounded-btn`
- Input: `rounded-input`

---

## Next Steps

1. **Install Dependencies:**
   ```bash
   npm install axios openai lucide-react
   ```

2. **Configure Environment:**
   ```env
   OPENAI_API_KEY=your_key_here  # Optional
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Navigate to Budget Module:**
   - Open http://localhost:3000
   - Click "Presupuestos" in the sidebar

---

## Troubleshooting

### Budget not loading
- Check that the DI container is initialized
- Verify API routes are accessible at `/api/budget`

### Ant expenses not showing
- This is normal if OPENAI_API_KEY is not configured
- The component uses mock data as fallback

### Styling issues
- Ensure Tailwind CSS is configured with custom colors
- Check `tailwind.config.js` for Banorte brand colors

---

**Created:** 2024-12-16  
**Version:** 1.0.0  
**Module:** Budget Module - UI Components

