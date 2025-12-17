# Budget Module - API Routes & Hooks Usage Guide

## Overview
This guide shows how to use the Budget Module API routes and React hooks to build budget management features.

---

## API Routes

### 1. Create Budget
**Endpoint:** `POST /api/budget`

**Request Body:**
```json
{
  "userId": "user-123",
  "month": "2024-01-01T00:00:00.000Z",
  "totalIncome": 25000,
  "currency": "MXN",
  "categories": [
    {
      "name": "Alimentación",
      "budgeted": 5000,
      "icon": "🍔",
      "color": "#FF6B6B"
    },
    {
      "name": "Transporte",
      "budgeted": 2000,
      "icon": "🚗",
      "color": "#4ECDC4"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "budget-uuid",
    "userId": "user-123",
    "month": "2024-01-01T00:00:00.000Z",
    "totalIncome": { "amount": 25000, "currency": "MXN" },
    "totalSpent": { "amount": 0, "currency": "MXN" },
    "available": { "amount": 25000, "currency": "MXN" },
    "percentageUsed": 0,
    "isOverBudget": false,
    "categories": [...]
  }
}
```

**Error Responses:**
- `400` - Missing required fields or validation error
- `409` - Budget already exists for this month
- `500` - Internal server error

---

### 2. Get Budget Summary
**Endpoint:** `GET /api/budget/summary`

**Query Parameters:**
- `userId` (required): User ID
- `month` (optional): ISO date string for specific month (defaults to current month)

**Example:**
```
GET /api/budget/summary?userId=user-123&month=2024-01-01T00:00:00.000Z
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "budget-uuid",
    "userId": "user-123",
    "month": "2024-01-01T00:00:00.000Z",
    "totalIncome": { "amount": 25000, "currency": "MXN" },
    "totalSpent": { "amount": 12500, "currency": "MXN" },
    "available": { "amount": 12500, "currency": "MXN" },
    "percentageUsed": 50,
    "isOverBudget": false,
    "categories": [...],
    "recentTransactions": [...],
    "comparison": {
      "previousMonth": {
        "totalSpent": { "amount": 10000, "currency": "MXN" },
        "percentageChange": 25
      }
    },
    "alerts": [
      {
        "type": "NEAR_LIMIT",
        "categoryId": "cat-1",
        "categoryName": "Alimentación",
        "message": "Estás cerca del límite en Alimentación (85% usado)"
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Missing userId or validation error
- `404` - Budget not found
- `500` - Internal server error

---

### 3. Detect Ant Expenses (AI-Powered)
**Endpoint:** `GET /api/budget/ant-expenses`

**Query Parameters:**
- `userId` (required): User ID
- `timeFrameMonths` (optional): Number of months to analyze (default: 1)

**Example:**
```
GET /api/budget/ant-expenses?userId=user-123&timeFrameMonths=3
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "totalMonthlyImpact": { "amount": 1980, "currency": "MXN" },
    "totalAnnualImpact": { "amount": 23760, "currency": "MXN" },
    "potentialMonthlySavings": { "amount": 1386, "currency": "MXN" },
    "overallRecommendation": "Identificamos 2 patrones de gastos hormiga...",
    "detections": [
      {
        "category": "Cafeterías",
        "description": "Compras frecuentes en cafeterías",
        "frequency": 12,
        "averageAmount": { "amount": 45, "currency": "MXN" },
        "monthlyImpact": { "amount": 540, "currency": "MXN" },
        "annualImpact": { "amount": 6480, "currency": "MXN" },
        "confidence": 0.85,
        "examples": [
          {
            "merchant": "Starbucks",
            "amount": { "amount": 50, "currency": "MXN" },
            "date": "2024-01-15T10:30:00.000Z"
          }
        ],
        "recommendation": "Considera preparar café en casa 3 días a la semana"
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Missing userId or invalid timeFrameMonths
- `500` - Internal server error

---

## React Hooks

### 1. useBudget Hook

**Import:**
```typescript
import { useBudget } from '@/app/hooks';
```

**Usage:**
```typescript
function BudgetDashboard() {
  const userId = 'user-123';
  const { budget, loading, error, refetch, createBudget } = useBudget(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!budget) return <div>No budget found</div>;

  return (
    <div>
      <h1>Budget for {budget.month}</h1>
      <p>Total Income: ${budget.totalIncome.amount}</p>
      <p>Total Spent: ${budget.totalSpent.amount}</p>
      <p>Available: ${budget.available.amount}</p>
      
      {budget.alerts.map(alert => (
        <div key={alert.categoryId} className="alert">
          {alert.message}
        </div>
      ))}
    </div>
  );
}
```

**Creating a Budget:**
```typescript
const handleCreateBudget = async () => {
  try {
    await createBudget({
      month: new Date('2024-01-01'),
      totalIncome: 25000,
      categories: [
        { name: 'Alimentación', budgeted: 5000, icon: '🍔' },
        { name: 'Transporte', budgeted: 2000, icon: '🚗' },
      ],
    });
    console.log('Budget created successfully!');
  } catch (err) {
    console.error('Failed to create budget:', err);
  }
};
```

---

### 2. useAntExpenses Hook

**Import:**
```typescript
import { useAntExpenses } from '@/app/hooks';
```

**Usage:**
```typescript
function AntExpensesAnalysis() {
  const userId = 'user-123';
  const { analysis, loading, error, refetch } = useAntExpenses(userId, 3); // 3 months

  if (loading) return <div>Analyzing expenses...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analysis) return <div>No analysis available</div>;

  return (
    <div>
      <h1>Ant Expenses Analysis</h1>
      <p>Monthly Impact: ${analysis.totalMonthlyImpact.amount}</p>
      <p>Potential Savings: ${analysis.potentialMonthlySavings.amount}</p>
      
      <h2>Detections:</h2>
      {analysis.detections.map((detection, idx) => (
        <div key={idx}>
          <h3>{detection.category}</h3>
          <p>{detection.description}</p>
          <p>Frequency: {detection.frequency} times/month</p>
          <p>Monthly Impact: ${detection.monthlyImpact.amount}</p>
          <p>Recommendation: {detection.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Complete Example Component

```typescript
'use client';

import { useBudget, useAntExpenses } from '@/app/hooks';

export default function BudgetPage() {
  const userId = 'user-123'; // Get from auth context
  const { budget, loading: budgetLoading, createBudget } = useBudget(userId);
  const { analysis, loading: analysisLoading } = useAntExpenses(userId, 1);

  if (budgetLoading || analysisLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>My Budget</h1>
      
      {budget ? (
        <div>
          <h2>Current Budget</h2>
          <p>Available: ${budget.available.amount} {budget.available.currency}</p>
        </div>
      ) : (
        <button onClick={() => createBudget({
          month: new Date(),
          totalIncome: 25000,
          categories: [{ name: 'Food', budgeted: 5000 }]
        })}>
          Create Budget
        </button>
      )}

      {analysis && (
        <div>
          <h2>Ant Expenses</h2>
          <p>Potential Savings: ${analysis.potentialMonthlySavings.amount}/month</p>
        </div>
      )}
    </div>
  );
}
```

