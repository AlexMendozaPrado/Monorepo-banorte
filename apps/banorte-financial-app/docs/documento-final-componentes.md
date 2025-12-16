**(Copiar del documento de componentes)**
```

Busca el componente aquí por su nombre y cópialo exactamente como está.

---

## 📂 Índice de Componentes por Carpeta

### `/components/ui/` (6 componentes base)
1. Button.tsx
2. Card.tsx
3. Input.tsx
4. ProgressBar.tsx
5. Modal.tsx
6. Stepper.tsx

### `/components/layout/` (2 componentes)
1. Sidebar.tsx
2. Header.tsx

### `/components/budget/` (6 componentes)
1. BudgetHeader.tsx
2. BudgetSummary.tsx
3. CategoryCard.tsx
4. SmallExpensesAlert.tsx
5. TopExpenses.tsx
6. CategoryModal.tsx

### `/components/savings/` (7 componentes)
1. EmergencyFundHero.tsx
2. SavingRuleCard.tsx
3. SavingRuleWizard.tsx
4. SavingsGoalCard.tsx
5. GoalModal.tsx
6. SavingsHistory.tsx
7. CelebrationModal.tsx

### `/components/cards/` (9 componentes)
1. CardCarousel.tsx
2. CreditCardDetail.tsx
3. DebitCardDetail.tsx
4. SmartRecommendations.tsx
5. UsageStrategy.tsx
6. BenefitsSection.tsx
7. PaymentModal.tsx
8. TransactionList.tsx
9. CardHealthScore.tsx

### `/components/debt/` (9 componentes)
1. DebtDashboard.tsx
2. DebtCard.tsx
3. PaymentStrategy.tsx
4. DebtDetailModal.tsx
5. PaymentSimulator.tsx
6. NormaRecommendations.tsx
7. CreditHealthScore.tsx
8. PaymentAlerts.tsx
9. AddDebtModal.tsx

### `/components/insurance/` (8 componentes)
1. ProtectionDashboard.tsx
2. InsuranceCard.tsx
3. NeedsEvaluator.tsx
4. InsuranceComparator.tsx
5. CoverageCalculator.tsx
6. EducationSection.tsx
7. NormaInsuranceRecommendation.tsx
8. QuoteModal.tsx

### `/components/advisor/` (Chat components - 7 componentes)
1. ChatMessage.tsx
2. InsightMessage.tsx
3. ComparisonMessage.tsx
4. QuickReplyOptions.tsx
5. ChatInput.tsx
6. TypingIndicator.tsx
7. ChatHistoryModal.tsx

### `/components/dashboard/` (Widgets - 3 componentes)
1. FinancialHealthScore.tsx
2. EmergencyFundWidget.tsx
3. QuickActionsGrid.tsx

### `/components/chat/` (1 componente global)
1. AIAdvisorChat.tsx (Floating chatbot)

### `/components/education/` (5 componentes)
1. EducationHero.tsx
2. TopicCard.tsx
3. ContentCard.tsx
4. LearningPath.tsx
5. Quiz.tsx

### `/pages/` (7 módulos principales)
1. DashboardCompact.tsx
2. BudgetModule.tsx
3. SavingsModule.tsx
4. CardsModule.tsx
5. DebtModule.tsx
6. InsuranceModule.tsx
7. AdvisorModule.tsx
8. EducationModule.tsx

---

## 📝 COMPONENTES COMPLETOS

Todos los componentes que compartiste están listos para usar. Están organizados exactamente como los tienes en tu documento original.

---

## 🚀 FLUJO DE IMPLEMENTACIÓN

### **PASO 1: Implementar PROMPT 1** (Fundamentos)
Aquí crearás la estructura base del proyecto. **No necesitas componentes aún**.

### **PASO 2: Implementar PROMPT 0 (UI Base)**
Copia estos componentes base:
- `/components/ui/` → Todos (Button, Card, Input, ProgressBar, Modal, Stepper)
- `/components/layout/` → Sidebar, Header
- `/components/widgets/` → FinancialHealthScore, EmergencyFundWidget, QuickActionsGrid
- `/components/chat/` → AIAdvisorChat

### **PASO 3: Implementar PROMPT 2** (Budget Module)
Copia estos componentes:
- `/components/budget/` → Todos los 6 componentes
- `/pages/BudgetModule.tsx`

### **PASO 4: Implementar PROMPT 3** (Savings Module)
Copia estos componentes:
- `/components/savings/` → Todos los 7 componentes
- `/pages/SavingsModule.tsx`

### **PASO 5: Implementar PROMPT 4** (Cards Module)
Copia estos componentes:
- `/components/cards/` → Todos los 9 componentes
- `/pages/CardsModule.tsx`

### **PASO 6: Implementar PROMPT 5** (Debt Module)
Copia estos componentes:
- `/components/debt/` → Todos los 9 componentes
- `/pages/DebtModule.tsx`

### **PASO 7: Implementar PROMPT 6** (Insurance Module)
Copia estos componentes:
- `/components/insurance/` → Todos los 8 componentes
- `/pages/InsuranceModule.tsx`

### **PASO 8: Implementar PROMPT 7** (Advisor + Dashboard)
Copia estos componentes:
- `/components/advisor/` o `/components/chat/` → Todos los 7 componentes del chat
- `/pages/AdvisorModule.tsx`
- `/pages/DashboardCompact.tsx`
- `/components/education/` → Si quieres el módulo de educación (opcional)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN
```
□ PROMPT 1: Fundamentos (sin componentes)
□ PROMPT 0: Componentes UI Base (10 componentes)
□ PROMPT 2: Budget Module (6 componentes + página)
□ PROMPT 3: Savings Module (7 componentes + página)
□ PROMPT 4: Cards Module (9 componentes + página)
□ PROMPT 5: Debt Module (9 componentes + página)
□ PROMPT 6: Insurance Module (8 componentes + página)
□ PROMPT 7: Advisor + Dashboard (7 componentes + 2 páginas)
```

---

## 🎨 ESTRUCTURA FINAL DE CARPETAS
```
src/app/
├── components/
│   ├── ui/ (6 componentes)
│   ├── layout/ (2 componentes)
│   ├── widgets/ (3 componentes)
│   ├── budget/ (6 componentes)
│   ├── savings/ (7 componentes)
│   ├── cards/ (9 componentes)
│   ├── debt/ (9 componentes)
│   ├── insurance/ (8 componentes)
│   ├── advisor/ o chat/ (7 componentes)
│   └── education/ (5 componentes - opcional)
└── pages/
    ├── DashboardCompact.tsx
    ├── BudgetModule.tsx
    ├── SavingsModule.tsx
    ├── CardsModule.tsx
    ├── DebtModule.tsx
    ├── InsuranceModule.tsx
    ├── AdvisorModule.tsx
    └── EducationModule.tsx (opcional)

    

```index.tsx
import './index.css'
import React from "react";
import { render } from "react-dom";
import { App } from "./App";

render(<App />, document.getElementById("root"));

```
```App.tsx
import React, { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardCompact } from './pages/DashboardCompact'
import { BudgetModule } from './pages/BudgetModule'
import { SavingsModule } from './pages/SavingsModule'
import { CardsModule } from './pages/CardsModule'
import { DebtModule } from './pages/DebtModule'
import { InsuranceModule } from './pages/InsuranceModule'
import { AdvisorModule } from './pages/AdvisorModule'
import { EducationModule } from './pages/EducationModule'
import { AIAdvisorChat } from './components/chat/AIAdvisorChat'
// Placeholder components for other views
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
      🚧
    </div>
    <h2 className="text-2xl font-bold text-banorte-dark mb-2">{title}</h2>
    <p className="text-banorte-gray max-w-md">
      Esta sección está en construcción. Pronto podrás acceder a todas las
      funcionalidades de {title.toLowerCase()}.
    </p>
  </div>
)
export function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardCompact />
      case 'presupuestos':
        return <BudgetModule />
      case 'ahorros':
        return <SavingsModule />
      case 'tarjetas':
        return <CardsModule />
      case 'deudas':
        return <DebtModule />
      case 'seguros':
        return <InsuranceModule />
      case 'educacion':
        return <EducationModule />
      case 'asesor':
        return <AdvisorModule />
      default:
        return <DashboardCompact />
    }
  }
  return (
    <div className="flex min-h-screen bg-banorte-bg font-sans text-banorte-dark">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </main>
      </div>

      {activeTab !== 'asesor' && <AIAdvisorChat />}
    </div>
  )
}

```
```tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        banorte: {
          red: "#EB0029", // Primary
          gray: "#5B6670", // Secondary
          dark: "#323E48", // Dark Text
          bg: "#EBF0F2", // Main Background
          light: "#F4F7F8", // Secondary Background
          white: "#FCFCFC", // Card Background
        },
        status: {
          success: "#6CC04A",
          warning: "#FFA400",
          alert: "#FF671B",
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Gotham', 'Montserrat', 'sans-serif'], // Fallback to Montserrat if Gotham unavailable
      },
      borderRadius: {
        'btn': '4px',
        'input': '6px',
        'card': '8px',
      },
      boxShadow: {
        'card': '0 3px 6px rgba(0,0,0,0.16)',
        'hover': '0 6px 12px rgba(0,0,0,0.20)',
      },
      spacing: {
        '5px': '5px',
        '10px': '10px',
        '15px': '15px',
        '20px': '20px',
        '25px': '25px',
        '30px': '30px',
        '35px': '35px',
        '40px': '40px',
        '45px': '45px',
        '50px': '50px',
      }
    },
  },
  plugins: [],
}

```
```index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```
```components/ui/Button.tsx
import React from 'react'
import { Loader2 } from 'lucide-react'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-display font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-btn'
  const variants = {
    primary:
      'bg-banorte-red text-white hover:bg-red-700 focus:ring-banorte-red shadow-sm hover:shadow-md',
    secondary:
      'bg-banorte-gray text-white hover:bg-gray-600 focus:ring-banorte-gray shadow-sm',
    outline:
      'border-2 border-banorte-red text-banorte-red hover:bg-red-50 focus:ring-banorte-red',
    ghost: 'text-banorte-gray hover:bg-gray-100 hover:text-banorte-dark',
    danger:
      'bg-status-alert text-white hover:bg-orange-600 focus:ring-status-alert',
  }
  const sizes = {
    sm: 'h-35px px-4 text-sm',
    md: 'h-45px px-6 text-base',
    lg: 'h-50px px-8 text-lg',
  }
  const widthClass = fullWidth ? 'w-full' : ''
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

```
```components/ui/Card.tsx
import React from 'react'
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverEffect?: boolean
  noPadding?: boolean
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
  )
}

```
```components/ui/Input.tsx
import React from 'react'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}
export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-banorte-gray mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full h-50px rounded-input border border-gray-300 bg-white 
            text-banorte-dark placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-banorte-red focus:border-transparent
            disabled:bg-gray-100 disabled:text-gray-500
            transition-colors duration-200
            ${icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-status-alert ring-1 ring-status-alert' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-status-alert">{error}</p>}
    </div>
  )
}

```
```components/ui/ProgressBar.tsx
import React from 'react'
interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'success' | 'warning' | 'alert' | 'secondary'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  className?: string
}
export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  height = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const colors = {
    primary: 'bg-banorte-red',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    alert: 'bg-status-alert',
    secondary: 'bg-banorte-gray',
  }
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }
  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium text-banorte-dark">{label}</span>
          <span className="text-banorte-gray">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[height]}`}
      >
        <div
          className={`${colors[color]} ${heights[height]} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}

```
```components/layout/Sidebar.tsx
import React from 'react'
import {
  LayoutDashboard,
  PieChart,
  PiggyBank,
  CreditCard,
  TrendingDown,
  Shield,
  BookOpen,
  MessageCircle,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}
export function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'presupuestos',
      label: 'Presupuestos',
      icon: PieChart,
    },
    {
      id: 'ahorros',
      label: 'Ahorros',
      icon: PiggyBank,
    },
    {
      id: 'tarjetas',
      label: 'Tarjetas',
      icon: CreditCard,
    },
    {
      id: 'deudas',
      label: 'Deudas',
      icon: TrendingDown,
    },
    {
      id: 'seguros',
      label: 'Seguros',
      icon: Shield,
    },
    {
      id: 'educacion',
      label: 'Educación',
      icon: BookOpen,
    },
    {
      id: 'asesor',
      label: 'Asesor IA',
      icon: MessageCircle,
    },
  ]
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-none border-r border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-banorte-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-display font-bold text-xl text-banorte-red tracking-tight">
                BANORTE
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-red-50 text-banorte-red font-bold shadow-sm' : 'text-banorte-gray hover:bg-gray-50 hover:text-banorte-dark font-medium'}
                  `}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-banorte-red" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 text-banorte-gray transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

```
```components/layout/Header.tsx
import React from 'react'
import { Bell, Search, Menu, User } from 'lucide-react'
import { Button } from '../ui/Button'
interface HeaderProps {
  onMenuClick: () => void
  userName?: string
}
export function Header({
  onMenuClick,
  userName = 'María González',
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-banorte-gray hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center text-banorte-gray text-sm">
          <span className="font-display font-medium text-banorte-dark">
            Hola, {userName}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          <span>Último acceso: Hoy, 10:30 AM</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            className="h-10 pl-10 pr-4 rounded-full bg-gray-50 border-none text-sm focus:ring-2 focus:ring-banorte-red w-64"
          />
        </div>

        <button className="relative p-2 text-banorte-gray hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-banorte-red rounded-full border-2 border-white animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 bg-banorte-red/10 rounded-full flex items-center justify-center text-banorte-red font-bold border border-banorte-red/20">
            MG
          </div>
        </div>
      </div>
    </header>
  )
}

```
```components/widgets/FinancialHealthScore.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { TrendingUp, Info } from 'lucide-react'
interface FinancialHealthScoreProps {
  score: number
  previousScore?: number
}
export function FinancialHealthScore({
  score,
  previousScore = 68,
}: FinancialHealthScoreProps) {
  // Calculate stroke dasharray for circle
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-status-success'
    if (s >= 60) return 'text-status-warning'
    return 'text-status-alert'
  }
  const getScoreStroke = (s: number) => {
    if (s >= 80) return 'stroke-status-success'
    if (s >= 60) return 'stroke-status-warning'
    return 'stroke-status-alert'
  }
  return (
    <Card className="flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 text-gray-400 hover:text-banorte-gray cursor-pointer">
        <Info size={18} />
      </div>

      <h3 className="text-banorte-gray font-medium text-sm mb-4 uppercase tracking-wider">
        Salud Financiera
      </h3>

      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-100"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${getScoreStroke(score)} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span
            className={`text-4xl font-display font-bold ${getScoreColor(score)}`}
          >
            {score}
          </span>
          <span className="text-xs text-gray-400 font-medium">/ 100</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <div className="flex items-center text-status-success bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={14} className="mr-1" />
          <span className="font-bold">+{score - previousScore} pts</span>
        </div>
        <span className="text-gray-500">vs mes anterior</span>
      </div>

      <p className="mt-4 text-center text-sm text-banorte-gray">
        ¡Vas muy bien! Tu salud financiera es{' '}
        <strong className="text-banorte-dark">estable</strong>.
      </p>
    </Card>
  )
}

```
```components/widgets/EmergencyFundWidget.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Button } from '../ui/Button'
import { ShieldCheck, Plus } from 'lucide-react'
interface EmergencyFundWidgetProps {
  currentAmount: number
  targetAmount: number
  monthsCovered: number
}
export function EmergencyFundWidget({
  currentAmount,
  targetAmount,
  monthsCovered,
}: EmergencyFundWidgetProps) {
  const percentage = Math.round((currentAmount / targetAmount) * 100)
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold text-banorte-dark">
              Fondo de Emergencia
            </h3>
            <p className="text-xs text-banorte-gray">Tu red de seguridad</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-gray-100 text-banorte-gray px-2 py-1 rounded">
          {monthsCovered} meses
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold text-banorte-dark">
            ${currentAmount.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 mb-1">
            meta: ${targetAmount.toLocaleString()}
          </span>
        </div>

        <ProgressBar
          value={currentAmount}
          max={targetAmount}
          color={percentage >= 100 ? 'success' : 'primary'}
          height="lg"
        />

        <p className="mt-3 text-sm text-banorte-gray">
          Has completado el{' '}
          <strong className="text-banorte-dark">{percentage}%</strong> de tu
          meta recomendada.
        </p>
      </div>

      <div className="mt-6">
        <Button variant="outline" size="sm" fullWidth className="text-xs">
          <Plus size={14} className="mr-1" />
          Aportar al fondo
        </Button>
      </div>
    </Card>
  )
}

```
```components/widgets/QuickActionsGrid.tsx
import React from 'react'
import { Card } from '../ui/Card'
import {
  PieChart,
  PiggyBank,
  CreditCard,
  TrendingDown,
  Shield,
  BookOpen,
  Send,
} from 'lucide-react'
export function QuickActionsGrid() {
  // In a real app, this would use a context or prop to change tabs
  // For now, we'll just log or use window.location if needed, but since App.tsx controls state,
  // we would ideally pass a handler here.
  // Assuming the user will click the sidebar for now, or we can add a simple prop later.
  const actions = [
    {
      id: 'transfer',
      label: 'Transferir',
      icon: Send,
      color: 'bg-banorte-red',
    },
    {
      id: 'presupuestos',
      label: 'Presupuesto',
      icon: PieChart,
      color: 'bg-blue-500',
    },
    {
      id: 'savings',
      label: 'Ahorrar',
      icon: PiggyBank,
      color: 'bg-green-500',
    },
    {
      id: 'cards',
      label: 'Tarjetas',
      icon: CreditCard,
      color: 'bg-purple-500',
    },
    {
      id: 'debt',
      label: 'Pagar Deuda',
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
    {
      id: 'insurance',
      label: 'Seguros',
      icon: Shield,
      color: 'bg-indigo-500',
    },
    {
      id: 'learn',
      label: 'Aprender',
      icon: BookOpen,
      color: 'bg-teal-500',
    },
  ]
  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          className="flex flex-col items-center gap-2 group"
          onClick={() => {
            // This is a quick hack to demonstrate interactivity if we had the context
            // In a real implementation, we'd pass setActiveTab as a prop
            console.log(`Clicked ${action.id}`)
          }}
        >
          <div
            className={`
            w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md
            transition-transform duration-200 group-hover:scale-110 group-hover:shadow-lg
            ${action.color}
          `}
          >
            <action.icon size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-medium text-banorte-gray group-hover:text-banorte-dark">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}

```
```components/chat/AIAdvisorChat.tsx
import React, { useEffect, useState, useRef } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Send, X, Minimize2, Maximize2, Sparkles, ThumbsUp } from 'lucide-react'
interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'suggestion' | 'action'
  actions?: {
    label: string
    action: string
  }[]
}
export function AIAdvisorChat({ minimized = false }: { minimized?: boolean }) {
  const [isOpen, setIsOpen] = useState(!minimized)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola María! Soy Norma, tu asesora financiera personal. He notado que tus gastos en restaurantes subieron un 15% este mes. ¿Te gustaría ver algunas sugerencias para optimizar tu presupuesto?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'suggestion',
      actions: [
        {
          label: 'Ver análisis',
          action: 'view_analysis',
        },
        {
          label: 'Ajustar presupuesto',
          action: 'adjust_budget',
        },
      ],
    },
  ])
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])
  const handleSend = () => {
    if (!input.trim()) return
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setIsTyping(true)
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Entiendo. Basado en tus patrones de consumo, te recomiendo establecer un límite semanal de $1,500 para salidas. Si lo sigues, podrías ahorrar $2,000 extra al mes para tu fondo de emergencia.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
    }, 1500)
  }
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-banorte-red rounded-full shadow-lg flex items-center justify-center text-white hover:bg-red-700 transition-all hover:scale-105 z-50"
      >
        <div className="relative">
          <Sparkles size={28} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-status-success rounded-full border-2 border-banorte-red"></span>
        </div>
      </button>
    )
  }
  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] flex flex-col shadow-2xl z-50 p-0 border-0 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-banorte-red p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <span className="font-display font-bold text-lg">N</span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Norma</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-status-success rounded-full"></span>
              <span className="text-xs opacity-90">Asesora Inteligente</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
        <div className="text-center text-xs text-gray-400 my-4">
          Hoy,{' '}
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`
                max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.sender === 'user' ? 'bg-banorte-red text-white rounded-tr-none' : 'bg-white text-banorte-dark border border-gray-100 rounded-tl-none'}
              `}
            >
              {msg.text}
            </div>

            {msg.actions && (
              <div className="flex gap-2 mt-2">
                {msg.actions.map((action, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1.5 bg-white border border-banorte-red/30 text-banorte-red text-xs font-medium rounded-full hover:bg-red-50 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '0ms',
                  }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '150ms',
                  }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '300ms',
                  }}
                ></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta..."
            className="flex-1 h-10 px-4 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-banorte-red focus:bg-white transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-banorte-red text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Sparkles size={10} />
            Impulsado por IA de Banorte
          </span>
        </div>
      </div>
    </Card>
  )
}

```
```pages/DashboardCompact.tsx
import React from 'react'
import { FinancialHealthScore } from '../components/widgets/FinancialHealthScore'
import { EmergencyFundWidget } from '../components/widgets/EmergencyFundWidget'
import { QuickActionsGrid } from '../components/widgets/QuickActionsGrid'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CreditCard,
} from 'lucide-react'
export function DashboardCompact() {
  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Buenos días, María
          </h1>
          <p className="text-banorte-gray">
            Aquí está tu resumen financiero de hoy.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Ver Reporte Mensual
          </Button>
          <Button size="sm">Nueva Transacción</Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-card shadow-sm border border-gray-100">
        <QuickActionsGrid />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Health & Emergency */}
        <div className="md:col-span-4 space-y-6">
          <FinancialHealthScore score={72} />
          <div className="h-64">
            <EmergencyFundWidget
              currentAmount={45000}
              targetAmount={60000}
              monthsCovered={4.5}
            />
          </div>
        </div>

        {/* Middle Column - Activity & Budget */}
        <div className="md:col-span-5 space-y-6">
          {/* Budget Summary Card */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-banorte-dark">
                Presupuesto Mensual
              </h3>
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                En orden
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Gastado</p>
                  <p className="text-2xl font-bold text-banorte-dark">
                    $18,500
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Disponible</p>
                  <p className="text-lg font-medium text-banorte-gray">
                    $6,500
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-banorte-red h-3 rounded-full w-[74%]" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Alimentos</p>
                  <p className="font-bold text-sm text-banorte-dark">65%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Transporte</p>
                  <p className="font-bold text-sm text-banorte-dark">42%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Ocio</p>
                  <p className="font-bold text-sm text-status-warning">85%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card noPadding>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-banorte-dark">
                Movimientos Recientes
              </h3>
              <button className="text-xs text-banorte-red font-medium hover:underline">
                Ver todos
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  name: 'Uber Eats',
                  date: 'Hoy, 2:30 PM',
                  amount: -245.0,
                  icon: '🍔',
                },
                {
                  name: 'Netflix',
                  date: 'Ayer',
                  amount: -199.0,
                  icon: '🎬',
                },
                {
                  name: 'Depósito Nómina',
                  date: '15 Oct',
                  amount: 12500.0,
                  icon: '💰',
                  positive: true,
                },
                {
                  name: 'Starbucks',
                  date: '14 Oct',
                  amount: -85.0,
                  icon: '☕',
                },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-banorte-dark">
                        {tx.name}
                      </p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${tx.positive ? 'text-status-success' : 'text-banorte-dark'}`}
                  >
                    {tx.positive ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Alerts & Cards */}
        <div className="md:col-span-3 space-y-6">
          {/* Alerts */}
          <Card className="bg-orange-50 border-orange-100">
            <div className="flex items-center gap-2 mb-3 text-status-alert">
              <AlertCircle size={20} />
              <h3 className="font-bold">Atención Requerida</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
                <p className="text-xs font-medium text-gray-800 mb-1">
                  Pago de Tarjeta Oro
                </p>
                <p className="text-xs text-gray-500 mb-2">Vence en 2 días</p>
                <button className="text-xs text-banorte-red font-bold">
                  Pagar ahora
                </button>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
                <p className="text-xs font-medium text-gray-800 mb-1">
                  Límite de Ocio
                </p>
                <p className="text-xs text-gray-500">Has alcanzado el 85%</p>
              </div>
            </div>
          </Card>

          {/* Cards Preview */}
          <Card className="bg-gradient-to-br from-banorte-dark to-gray-800 text-white">
            <div className="flex justify-between items-start mb-6">
              <CreditCard className="opacity-80" />
              <span className="text-xs font-medium opacity-70">
                Banorte Oro
              </span>
            </div>
            <div className="mb-4">
              <p className="text-xs opacity-70 mb-1">Saldo actual</p>
              <p className="text-2xl font-bold">$12,450.00</p>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-xs opacity-70">**** 4582</p>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                className="h-6 opacity-80"
              />
            </div>
          </Card>

          {/* Gamification Teaser */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-lg">
                🏆
              </div>
              <div>
                <p className="text-sm font-bold text-purple-900">
                  Racha de Ahorro
                </p>
                <p className="text-xs text-purple-700">12 días seguidos</p>
              </div>
            </div>
            <div className="w-full bg-purple-200 h-1.5 rounded-full mt-2">
              <div className="bg-purple-600 h-1.5 rounded-full w-[60%]" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

```
```components/ui/Modal.tsx
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  if (!isOpen) return null
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`
          bg-white rounded-card shadow-2xl w-full ${maxWidthClasses[maxWidth]} 
          transform transition-all animate-in zoom-in-95 duration-200
          flex flex-col max-h-[90vh]
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-display font-bold text-banorte-dark">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-banorte-red transition-colors p-1 rounded-full hover:bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

```
```components/budget/BudgetHeader.tsx
import React from 'react'
import { Button } from '../ui/Button'
import { Calendar, Download, Plus } from 'lucide-react'
interface BudgetHeaderProps {
  currentMonth: string
  onMonthChange: (month: string) => void
  onAddCategory: () => void
}
export function BudgetHeader({
  currentMonth,
  onMonthChange,
  onAddCategory,
}: BudgetHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-banorte-dark mb-1">
          Presupuestos
        </h1>
        <div className="flex items-center gap-2 text-banorte-gray text-sm">
          <Calendar size={16} />
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent border-none font-medium focus:ring-0 cursor-pointer hover:text-banorte-red transition-colors"
          >
            <option value="Octubre 2024">Octubre 2024</option>
            <option value="Septiembre 2024">Septiembre 2024</option>
            <option value="Agosto 2024">Agosto 2024</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
          <Download size={16} className="mr-2" />
          Exportar
        </Button>
        <Button
          onClick={onAddCategory}
          size="sm"
          className="flex-1 md:flex-none"
        >
          <Plus size={16} className="mr-2" />
          Crear Categoría
        </Button>
      </div>
    </div>
  )
}

```
```components/budget/BudgetSummary.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
interface BudgetSummaryProps {
  income: number
  spent: number
  available: number
}
export function BudgetSummary({
  income,
  spent,
  available,
}: BudgetSummaryProps) {
  const percentage = Math.round((spent / income) * 100)
  const getStatusColor = (pct: number) => {
    if (pct < 70) return 'success'
    if (pct < 90) return 'warning'
    return 'alert'
  }
  return (
    <Card className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-banorte-gray mb-1">Ingreso Esperado</p>
          <p className="text-2xl font-bold text-banorte-dark">
            ${income.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-banorte-gray mb-1">Gastado</p>
          <p className="text-2xl font-bold text-banorte-dark">
            ${spent.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 mb-1">Disponible</p>
          <p className="text-2xl font-bold text-blue-700">
            ${available.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-banorte-dark">
            Progreso General
          </span>
          <span
            className={`text-sm font-bold ${percentage > 90 ? 'text-status-alert' : 'text-banorte-gray'}`}
          >
            {percentage}% utilizado
          </span>
        </div>
        <ProgressBar
          value={spent}
          max={income}
          color={getStatusColor(percentage)}
          height="lg"
        />
      </div>
    </Card>
  )
}

```
```components/budget/CategoryCard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Edit2, TrendingUp, AlertCircle } from 'lucide-react'
interface CategoryCardProps {
  id: string
  name: string
  icon: React.ReactNode
  spent: number
  budget: number
  trend: 'up' | 'down' | 'stable'
  onEdit: (id: string) => void
}
export function CategoryCard({
  id,
  name,
  icon,
  spent,
  budget,
  trend,
  onEdit,
}: CategoryCardProps) {
  const percentage = Math.round((spent / budget) * 100)
  const isOverBudget = percentage > 100
  const getStatusColor = (pct: number) => {
    if (pct < 70) return 'success'
    if (pct < 90) return 'warning'
    return 'alert'
  }
  return (
    <Card hoverEffect className="relative group">
      <button
        onClick={() => onEdit(id)}
        className="absolute top-3 right-3 p-2 text-gray-300 hover:text-banorte-red hover:bg-gray-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <Edit2 size={16} />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-banorte-gray">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-banorte-dark">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {trend === 'up' && (
              <TrendingUp size={12} className="text-status-alert" />
            )}
            <span>+12% vs mes anterior</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-lg font-bold text-banorte-dark">
            ${spent.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">
            de ${budget.toLocaleString()}
          </span>
        </div>

        <ProgressBar
          value={spent}
          max={budget}
          color={getStatusColor(percentage)}
          height="md"
        />

        {isOverBudget && (
          <div className="flex items-center gap-1 text-xs text-status-alert font-medium bg-orange-50 p-1.5 rounded">
            <AlertCircle size={12} />
            <span>Excedido por ${(spent - budget).toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

```
```components/budget/SmallExpensesAlert.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { AlertTriangle, Coffee, ShoppingBag, Smartphone } from 'lucide-react'
export function SmallExpensesAlert() {
  return (
    <Card className="bg-orange-50 border border-orange-100">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-status-warning shadow-sm">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">
            Gastos Hormiga Detectados
          </h3>
          <p className="text-sm text-banorte-gray mb-4">
            Norma ha identificado 3 gastos recurrentes que suman{' '}
            <strong className="text-banorte-dark">$1,250/mes</strong>.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Cafeterías</span>
              </div>
              <span className="text-sm font-bold text-banorte-red">$450</span>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-gray-400" />
                <span className="text-sm font-medium">
                  Tiendas de conveniencia
                </span>
              </div>
              <span className="text-sm font-bold text-banorte-red">$320</span>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Apps de delivery</span>
              </div>
              <span className="text-sm font-bold text-banorte-red">$480</span>
            </div>
          </div>

          <Button
            size="sm"
            fullWidth
            className="bg-status-warning hover:bg-orange-600 text-white border-none"
          >
            Crear regla de ahorro automático
          </Button>
        </div>
      </div>
    </Card>
  )
}

```
```components/budget/TopExpenses.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ArrowUpRight, Calendar } from 'lucide-react'
export function TopExpenses() {
  const expenses = [
    {
      name: 'Renta Departamento',
      amount: 8500,
      date: '01 Oct',
      category: 'Hogar',
    },
    {
      name: 'Supermercado Walmart',
      amount: 2450,
      date: '05 Oct',
      category: 'Alimentos',
    },
    {
      name: 'Seguro de Auto',
      amount: 1800,
      date: '12 Oct',
      category: 'Seguros',
    },
    {
      name: 'Cena Restaurante',
      amount: 1200,
      date: '14 Oct',
      category: 'Ocio',
      unusual: true,
    },
    {
      name: 'Gasolina',
      amount: 950,
      date: '08 Oct',
      category: 'Transporte',
    },
  ]
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark">Gastos más fuertes</h3>
        <span className="text-xs text-banorte-gray bg-gray-100 px-2 py-1 rounded">
          Octubre
        </span>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 text-banorte-red flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-banorte-dark">
                  {expense.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{expense.category}</span>
                  <span>•</span>
                  <span>{expense.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-banorte-dark">
                -${expense.amount.toLocaleString()}
              </p>
              {expense.unusual && (
                <span className="text-[10px] text-status-warning bg-orange-50 px-1.5 py-0.5 rounded font-medium">
                  Inusual
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

```
```components/budget/CategoryModal.tsx
import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Bell, Tag } from 'lucide-react'
interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: {
    id: string
    name: string
    budget: number
  } | null
}
export function CategoryModal({
  isOpen,
  onClose,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    budget: category?.budget || '',
    alertThreshold: 80,
    notes: '',
  })
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Editar Categoría' : 'Nueva Categoría'}
    >
      <div className="space-y-4">
        <Input
          label="Nombre de la categoría"
          placeholder="Ej. Alimentos, Transporte..."
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          icon={<Tag size={18} />}
        />

        <Input
          label="Monto presupuestado"
          type="number"
          placeholder="0.00"
          value={formData.budget}
          onChange={(e) =>
            setFormData({
              ...formData,
              budget: e.target.value,
            })
          }
          icon={<span className="text-gray-400 font-bold">$</span>}
        />

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-banorte-dark flex items-center gap-2">
              <Bell size={16} className="text-banorte-gray" />
              Alerta de consumo
            </label>
            <span className="text-sm font-bold text-banorte-red">
              {formData.alertThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={formData.alertThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                alertThreshold: parseInt(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-banorte-red"
          />
          <p className="text-xs text-gray-500 mt-2">
            Te avisaremos cuando llegues al {formData.alertThreshold}% de tu
            presupuesto.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-banorte-gray mb-1">
            Notas
          </label>
          <textarea
            className="w-full p-3 rounded-input border border-gray-300 focus:ring-2 focus:ring-banorte-red focus:border-transparent text-sm"
            rows={3}
            placeholder="Descripción opcional..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```pages/BudgetModule.tsx
import React, { useState } from 'react'
import { BudgetHeader } from '../components/budget/BudgetHeader'
import { BudgetSummary } from '../components/budget/BudgetSummary'
import { CategoryCard } from '../components/budget/CategoryCard'
import { SmallExpensesAlert } from '../components/budget/SmallExpensesAlert'
import { TopExpenses } from '../components/budget/TopExpenses'
import { CategoryModal } from '../components/budget/CategoryModal'
import {
  ShoppingCart,
  Car,
  Coffee,
  Home,
  Zap,
  Heart,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react'
export function BudgetModule() {
  const [currentMonth, setCurrentMonth] = useState('Octubre 2024')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const categories = [
    {
      id: '1',
      name: 'Alimentos',
      icon: <ShoppingCart size={20} />,
      spent: 4500,
      budget: 6000,
      trend: 'up' as const,
    },
    {
      id: '2',
      name: 'Transporte',
      icon: <Car size={20} />,
      spent: 2100,
      budget: 2500,
      trend: 'stable' as const,
    },
    {
      id: '3',
      name: 'Ocio',
      icon: <Coffee size={20} />,
      spent: 1800,
      budget: 1500,
      trend: 'up' as const,
    },
    {
      id: '4',
      name: 'Hogar',
      icon: <Home size={20} />,
      spent: 8500,
      budget: 8500,
      trend: 'stable' as const,
    },
    {
      id: '5',
      name: 'Servicios',
      icon: <Zap size={20} />,
      spent: 1200,
      budget: 2000,
      trend: 'down' as const,
    },
    {
      id: '6',
      name: 'Salud',
      icon: <Heart size={20} />,
      spent: 400,
      budget: 1000,
      trend: 'stable' as const,
    },
    {
      id: '7',
      name: 'Educación',
      icon: <BookOpen size={20} />,
      spent: 0,
      budget: 2000,
      trend: 'stable' as const,
    },
    {
      id: '8',
      name: 'Otros',
      icon: <MoreHorizontal size={20} />,
      spent: 350,
      budget: 1500,
      trend: 'down' as const,
    },
  ]
  const handleEditCategory = (id: string) => {
    setSelectedCategory(id)
    setIsModalOpen(true)
  }
  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <BudgetHeader
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onAddCategory={handleAddCategory}
      />

      <BudgetSummary income={30000} spent={18850} available={11150} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Categories Grid */}
        <div className="lg:col-span-8">
          <h2 className="text-lg font-bold text-banorte-dark mb-4">
            Categorías de Gastos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} onEdit={handleEditCategory} />
            ))}
          </div>
        </div>

        {/* Sidebar - Alerts & Top Expenses */}
        <div className="lg:col-span-4 space-y-6">
          <SmallExpensesAlert />
          <TopExpenses />
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={
          selectedCategory
            ? {
                id: '1',
                name: 'Alimentos',
                budget: 6000,
              }
            : null
        }
      />
    </div>
  )
}

```
```components/ui/Stepper.tsx
import React from 'react'
import { Check } from 'lucide-react'
interface StepperProps {
  steps: string[]
  currentStep: number
}
export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1 relative"
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  absolute top-4 left-1/2 w-full h-0.5 -z-10
                  ${index < currentStep ? 'bg-banorte-red' : 'bg-gray-200'}
                `}
              />
            )}

            {/* Step Circle */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors duration-300
                ${isCompleted ? 'bg-banorte-red text-white' : ''}
                ${isCurrent ? 'bg-white border-2 border-banorte-red text-banorte-red' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
              `}
            >
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>

            {/* Step Label */}
            <span
              className={`
                text-xs font-medium text-center transition-colors duration-300
                ${isCurrent ? 'text-banorte-red' : 'text-gray-500'}
              `}
            >
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}

```
```components/savings/EmergencyFundHero.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { TrendingUp, Info, ShieldCheck } from 'lucide-react'
interface EmergencyFundHeroProps {
  saved: number
  target: number
  monthlyContribution: number
}
export function EmergencyFundHero({
  saved,
  target,
  monthlyContribution,
}: EmergencyFundHeroProps) {
  const percentage = Math.round((saved / target) * 100)
  const remaining = target - saved
  const monthsToGoal = (remaining / monthlyContribution).toFixed(1)
  // Circle calculations
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-4">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 mb-2">
            <ShieldCheck size={24} />
            <h2 className="text-lg font-bold font-display">
              Fondo de Emergencia
            </h2>
          </div>

          <div>
            <p className="text-4xl font-bold text-banorte-dark mb-1">
              ${saved.toLocaleString()}
            </p>
            <p className="text-banorte-gray">
              de{' '}
              <span className="font-medium text-banorte-dark">
                ${target.toLocaleString()}
              </span>{' '}
              meta recomendada
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button>Aportar Ahora</Button>
            <Button variant="outline">Ajustar Meta</Button>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-blue-100 inline-flex items-start gap-2 text-sm text-banorte-gray max-w-md">
            <span className="text-lg">💡</span>
            <p>
              Con tu ritmo actual de{' '}
              <strong className="text-banorte-dark">
                ${monthlyContribution}/mes
              </strong>
              , completarás tu fondo en{' '}
              <strong className="text-blue-600">{monthsToGoal} meses</strong>.
            </p>
          </div>
        </div>

        {/* Right Content - Circular Progress */}
        <div className="relative w-64 h-64 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-blue-100"
            />
            {/* Progress Circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-blue-500 transition-all duration-1500 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-display font-bold text-blue-600">
              {percentage}%
            </span>
            <span className="text-sm text-gray-500 font-medium mt-1">
              completado
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

```
```components/savings/SavingRuleCard.tsx
import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Edit2, Coins, Percent, Calendar, Sparkles } from 'lucide-react'
interface SavingRuleCardProps {
  type: 'roundup' | 'percentage' | 'fixed' | 'smart'
  title: string
  description: string
  amountSaved: number
  frequency: string
  isActive: boolean
  onToggle: () => void
  onEdit: () => void
}
export function SavingRuleCard({
  type,
  title,
  description,
  amountSaved,
  frequency,
  isActive,
  onToggle,
  onEdit,
}: SavingRuleCardProps) {
  const icons = {
    roundup: <Coins size={24} />,
    percentage: <Percent size={24} />,
    fixed: <Calendar size={24} />,
    smart: <Sparkles size={24} />,
  }
  const colors = {
    roundup: 'bg-purple-100 text-purple-600',
    percentage: 'bg-blue-100 text-blue-600',
    fixed: 'bg-green-100 text-green-600',
    smart: 'bg-orange-100 text-orange-600',
  }
  return (
    <Card
      className={`relative group transition-all duration-300 ${!isActive ? 'opacity-75 grayscale' : ''}`}
    >
      <button
        onClick={onEdit}
        className="absolute top-3 right-3 p-2 text-gray-300 hover:text-banorte-red hover:bg-gray-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <Edit2 size={16} />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colors[type]}`}>{icons[type]}</div>
        <div>
          <h3 className="font-bold text-banorte-dark">{title}</h3>
          <p className="text-xs text-banorte-gray mt-1 line-clamp-2 h-8">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end border-b border-gray-100 pb-3">
          <div>
            <p className="text-xs text-gray-400">Total ahorrado</p>
            <p className="text-lg font-bold text-banorte-dark">
              ${amountSaved.toLocaleString()}
            </p>
          </div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-banorte-gray">
            {frequency}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span
            className={`text-xs font-medium ${isActive ? 'text-status-success' : 'text-gray-400'}`}
          >
            {isActive ? 'Activa' : 'Pausada'}
          </span>
          <button
            onClick={onToggle}
            className={`
              w-10 h-5 rounded-full transition-colors duration-300 relative
              ${isActive ? 'bg-status-success' : 'bg-gray-300'}
            `}
          >
            <div
              className={`
                w-3 h-3 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm
                ${isActive ? 'left-6' : 'left-1'}
              `}
            />
          </button>
        </div>
      </div>
    </Card>
  )
}

```
```components/savings/SavingRuleWizard.tsx
import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Stepper } from '../ui/Stepper'
import { Input } from '../ui/Input'
import {
  Coins,
  Percent,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
interface SavingRuleWizardProps {
  isOpen: boolean
  onClose: () => void
}
export function SavingRuleWizard({ isOpen, onClose }: SavingRuleWizardProps) {
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const steps = ['Tipo', 'Detalles', 'Simulación', 'Confirmar']
  const ruleTypes = [
    {
      id: 'roundup',
      title: 'Redondeo',
      desc: 'Ahorra el cambio en cada compra',
      icon: <Coins size={24} />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'percentage',
      title: '% Ingresos',
      desc: 'Porcentaje de tu nómina',
      icon: <Percent size={24} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'fixed',
      title: 'Monto Fijo',
      desc: 'Ahorro recurrente programado',
      icon: <Calendar size={24} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'smart',
      title: 'Inteligente',
      desc: 'IA analiza y ahorra por ti',
      icon: <Sparkles size={24} />,
      color: 'bg-orange-100 text-orange-600',
    },
  ]
  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else onClose()
  }
  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ruleTypes.map((rule) => (
              <button
                key={rule.id}
                onClick={() => setSelectedType(rule.id)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                  ${selectedType === rule.id ? 'border-banorte-red bg-red-50' : 'border-gray-100 hover:border-gray-200'}
                `}
              >
                <div
                  className={`w-12 h-12 rounded-lg ${rule.color} flex items-center justify-center mb-3`}
                >
                  {rule.icon}
                </div>
                <h3 className="font-bold text-banorte-dark">{rule.title}</h3>
                <p className="text-sm text-banorte-gray">{rule.desc}</p>
              </button>
            ))}
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">
                Configuración de Porcentaje
              </h4>
              <p className="text-sm text-blue-600">
                Si ganas $15,000 quincenales, ahorrarás $1,500.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-2">
                Porcentaje a ahorrar
              </label>
              <input
                type="range"
                min="1"
                max="30"
                defaultValue="10"
                className="w-full accent-banorte-red"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span className="font-bold text-banorte-red">10%</span>
                <span>30%</span>
              </div>
            </div>

            <Input label="Cuenta Destino" placeholder="Seleccionar cuenta..." />
            <Input label="Fecha de Inicio" type="date" />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-600 uppercase font-bold">
                  En 6 meses
                </p>
                <p className="text-2xl font-bold text-green-700">$9,000</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 uppercase font-bold">
                  En 1 año
                </p>
                <p className="text-2xl font-bold text-blue-700">$18,000</p>
              </div>
            </div>

            <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
              <span className="text-gray-400 text-sm">
                Gráfica de proyección aquí
              </span>
            </div>

            <p className="text-sm text-center text-banorte-gray">
              Con esta regla, alcanzarás tu fondo de emergencia en{' '}
              <strong className="text-banorte-dark">5.2 meses</strong>.
            </p>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent size={32} />
              </div>
              <h3 className="text-xl font-bold text-banorte-dark mb-1">
                10% de Ingresos
              </h3>
              <p className="text-banorte-gray mb-4">
                Ahorro quincenal automático
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white p-2 rounded-lg inline-block">
                <span>Cuenta Nómina</span>
                <ArrowRight size={14} />
                <span>Fondo Emergencia</span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                className="mt-1 rounded text-banorte-red focus:ring-banorte-red"
              />
              <span className="text-sm text-banorte-gray">
                Confirmo que deseo activar esta regla de ahorro automático.
                Podré pausarla o cancelarla en cualquier momento.
              </span>
            </label>
          </div>
        )
      default:
        return null
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Regla de Ahorro"
      maxWidth="lg"
    >
      <div className="py-2">
        <Stepper steps={steps} currentStep={step} />

        <div className="min-h-[300px] py-4">{renderStepContent()}</div>

        <div className="flex justify-between pt-4 border-t border-gray-100 mt-4">
          <Button
            variant="secondary"
            onClick={step === 0 ? onClose : handleBack}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          <Button onClick={handleNext} disabled={step === 0 && !selectedType}>
            {step === 3 ? 'Activar Regla' : 'Continuar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```components/savings/SavingsGoalCard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { MoreVertical, Calendar } from 'lucide-react'
interface SavingsGoalCardProps {
  name: string
  target: number
  saved: number
  targetDate: string
  image?: string
  icon?: React.ReactNode
}
export function SavingsGoalCard({
  name,
  target,
  saved,
  targetDate,
  image,
  icon,
}: SavingsGoalCardProps) {
  const percentage = Math.round((saved / target) * 100)
  return (
    <Card hoverEffect className="overflow-hidden group">
      <div className="relative h-32 -mx-5 -mt-5 mb-4 bg-gray-100">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-3 left-5 text-white">
          <h3 className="font-bold text-lg shadow-sm">{name}</h3>
        </div>

        <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-2xl font-bold text-banorte-dark">
              ${saved.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 mb-1">
              de ${target.toLocaleString()}
            </span>
          </div>
          <ProgressBar
            value={saved}
            max={target}
            height="md"
            color={percentage >= 100 ? 'success' : 'primary'}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>Meta: {targetDate}</span>
          </div>
          <span className="font-medium text-banorte-red">{percentage}%</span>
        </div>
      </div>
    </Card>
  )
}

```
```components/savings/GoalModal.tsx
import React from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Image, Calculator } from 'lucide-react'
interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
}
export function GoalModal({ isOpen, onClose }: GoalModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Meta de Ahorro">
      <div className="space-y-4">
        <Input
          label="Nombre de la meta"
          placeholder="Ej. Vacaciones, Auto, Casa"
        />
        <Input label="Monto objetivo" type="number" placeholder="$0.00" />
        <Input label="¿Para cuándo?" type="date" />

        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-banorte-red hover:text-banorte-red hover:bg-red-50 transition-all cursor-pointer">
          <Image size={32} className="mb-2" />
          <span className="text-sm font-medium">
            Subir imagen inspiracional
          </span>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <Calculator className="text-blue-600 mt-1" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-800">
              Calculadora de Ahorro
            </p>
            <p className="text-sm text-blue-600">
              Para lograr tu meta en la fecha seleccionada, necesitas ahorrar{' '}
              <strong className="text-blue-800">$2,500 mensualmente</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-banorte-red focus:ring-banorte-red"
            />
            <span className="text-sm text-banorte-dark">
              Vincular con regla automática
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Crear Meta
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```components/savings/SavingsHistory.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { TrendingUp, Award, Calendar } from 'lucide-react'
export function SavingsHistory() {
  const badges = [
    {
      icon: '🎯',
      title: 'Primera Meta',
      date: 'Sep 2024',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      icon: '🔥',
      title: 'Racha 3 Meses',
      date: 'Oct 2024',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      icon: '💰',
      title: '$10k Ahorrados',
      date: 'Ago 2024',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: '📈',
      title: 'Consistente',
      date: 'Sep 2024',
      color: 'bg-blue-100 text-blue-700',
    },
  ]
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-banorte-dark">Historial de Ahorros</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-red-50 text-banorte-red text-sm font-medium rounded-full">
              Gráfica
            </button>
            <button className="px-3 py-1 text-gray-500 text-sm font-medium hover:bg-gray-50 rounded-full">
              Movimientos
            </button>
          </div>
        </div>

        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent" />
          <span className="text-gray-400 text-sm relative z-10">
            Gráfica de área interactiva aquí
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Total Ahorrado</p>
            <p className="font-bold text-banorte-dark">$45,000</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Promedio Mensual</p>
            <p className="font-bold text-banorte-dark">$3,200</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Mejor Mes</p>
            <p className="font-bold text-status-success">Ago ($4.5k)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Racha Actual</p>
            <p className="font-bold text-orange-500">8 meses 🔥</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-banorte-dark mb-4">
          Logros Desbloqueados
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${badge.color}`}
              >
                {badge.icon}
              </div>
              <p className="text-sm font-bold text-banorte-dark">
                {badge.title}
              </p>
              <p className="text-xs text-gray-400">{badge.date}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

```
```components/savings/CelebrationModal.tsx
import React, { useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Share2, Trophy } from 'lucide-react'
interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
}
export function CelebrationModal({ isOpen, onClose }: CelebrationModalProps) {
  // In a real implementation, we would trigger confetti here
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
          🎉
        </div>

        <h2 className="text-2xl font-bold text-banorte-dark mb-2">
          ¡Felicidades, María!
        </h2>
        <p className="text-banorte-gray mb-6">
          Has completado tu meta{' '}
          <strong className="text-banorte-dark">Vacaciones Cancún</strong>{' '}
          ahorrando <strong className="text-status-success">$20,000</strong>.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-banorte-gray italic border border-gray-100">
          "¡Increíble! Tu disciplina y constancia dieron frutos. ¿Lista para tu
          próxima meta?"
          <div className="mt-2 font-bold text-banorte-red not-italic">
            - Norma
          </div>
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={onClose}>
            Crear Nueva Meta
          </Button>
          <Button variant="outline" fullWidth>
            <Share2 size={16} className="mr-2" />
            Compartir Logro
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```pages/SavingsModule.tsx
import React, { useState } from 'react'
import { EmergencyFundHero } from '../components/savings/EmergencyFundHero'
import { SavingRuleCard } from '../components/savings/SavingRuleCard'
import { SavingRuleWizard } from '../components/savings/SavingRuleWizard'
import { SavingsGoalCard } from '../components/savings/SavingsGoalCard'
import { GoalModal } from '../components/savings/GoalModal'
import { SavingsHistory } from '../components/savings/SavingsHistory'
import { CelebrationModal } from '../components/savings/CelebrationModal'
import { Button } from '../components/ui/Button'
import { Plus, Plane, Car, Home } from 'lucide-react'
export function SavingsModule() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false)
  // Mock toggle handler
  const handleToggle = () => {}
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Ahorros Automáticos
          </h1>
          <p className="text-banorte-gray">
            Construye tu futuro financiero sin esfuerzo
          </p>
        </div>
        <Button
          onClick={() => setIsCelebrationOpen(true)}
          variant="outline"
          size="sm"
        >
          Simular Logro 🎉
        </Button>
      </div>

      {/* Hero Section */}
      <EmergencyFundHero
        saved={45000}
        target={60000}
        monthlyContribution={3200}
      />

      {/* Active Rules Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-banorte-dark">
              Reglas de Ahorro Activas
            </h2>
            <span className="bg-red-100 text-banorte-red text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
          </div>
          <Button size="sm" onClick={() => setIsWizardOpen(true)}>
            <Plus size={16} className="mr-1" />
            Nueva Regla
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SavingRuleCard
            type="roundup"
            title="Redondeo de Compras"
            description="Redondea cada compra al múltiplo de $10 más cercano"
            amountSaved={1240}
            frequency="Automático"
            isActive={true}
            onToggle={handleToggle}
            onEdit={() => setIsWizardOpen(true)}
          />
          <SavingRuleCard
            type="percentage"
            title="10% de Nómina"
            description="Ahorra el 10% de cada depósito de nómina"
            amountSaved={7500}
            frequency="Quincenal"
            isActive={true}
            onToggle={handleToggle}
            onEdit={() => setIsWizardOpen(true)}
          />
          <SavingRuleCard
            type="fixed"
            title="Ahorro Mensual"
            description="$500 cada día 1 del mes"
            amountSaved={3000}
            frequency="Mensual"
            isActive={false}
            onToggle={handleToggle}
            onEdit={() => setIsWizardOpen(true)}
          />
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-banorte-dark">
            Metas de Ahorro Personalizadas
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsGoalModalOpen(true)}
          >
            <Plus size={16} className="mr-1" />
            Nueva Meta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SavingsGoalCard
            name="Vacaciones Cancún"
            target={20000}
            saved={15000}
            targetDate="Julio 2025"
            icon={<Plane size={40} className="text-blue-400" />}
          />
          <SavingsGoalCard
            name="Enganche Auto Nuevo"
            target={150000}
            saved={80000}
            targetDate="Dic 2025"
            icon={<Car size={40} className="text-red-400" />}
          />
          <SavingsGoalCard
            name="Fondo para Casa"
            target={500000}
            saved={200000}
            targetDate="2027"
            icon={<Home size={40} className="text-green-400" />}
          />
        </div>
      </div>

      {/* History Section */}
      <SavingsHistory />

      {/* Modals */}
      <SavingRuleWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
      />
    </div>
  )
}

```
```components/cards/CardCarousel.tsx
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
interface CardData {
  id: string
  type: 'credit' | 'debit'
  name: string
  number: string
  network: 'visa' | 'mastercard'
  balance: number
  limit?: number
  color: string
}
interface CardCarouselProps {
  cards: CardData[]
  activeCardIndex: number
  onCardChange: (index: number) => void
}
export function CardCarousel({
  cards,
  activeCardIndex,
  onCardChange,
}: CardCarouselProps) {
  const handlePrev = () => {
    if (activeCardIndex > 0) onCardChange(activeCardIndex - 1)
  }
  const handleNext = () => {
    if (activeCardIndex < cards.length - 1) onCardChange(activeCardIndex + 1)
  }
  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={activeCardIndex === 0}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={24} className="text-banorte-gray" />
        </button>

        <div className="w-72 h-44 perspective-1000 relative">
          <div
            className={`
              w-full h-full rounded-xl shadow-xl p-6 text-white relative overflow-hidden transition-all duration-500 transform
              ${cards[activeCardIndex].color}
            `}
          >
            {/* Card Background Pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="font-bold text-lg tracking-wider">
                  BANORTE
                </span>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                  {cards[activeCardIndex].type === 'credit'
                    ? 'Crédito'
                    : 'Débito'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-7 bg-yellow-400/80 rounded flex items-center justify-center">
                  <div className="w-6 h-4 border border-yellow-600/50 rounded-sm" />
                </div>
                <CreditCard size={20} className="opacity-80" />
              </div>

              <div>
                <p className="font-mono text-xl tracking-widest mb-1 shadow-sm">
                  {cards[activeCardIndex].number}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] opacity-80 uppercase">Titular</p>
                    <p className="text-sm font-medium tracking-wide">
                      MARÍA GONZÁLEZ
                    </p>
                  </div>
                  <div className="font-bold italic text-lg opacity-90">
                    {cards[activeCardIndex].network === 'visa'
                      ? 'VISA'
                      : 'Mastercard'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={activeCardIndex === cards.length - 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={24} className="text-banorte-gray" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onCardChange(idx)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${idx === activeCardIndex ? 'w-6 bg-banorte-red' : 'bg-gray-300'}
            `}
          />
        ))}
      </div>
    </div>
  )
}

```
```components/cards/CreditCardDetail.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { AlertCircle, Calendar, DollarSign, Info } from 'lucide-react'
interface CreditCardDetailProps {
  used: number
  limit: number
  paymentDue: string
  minPayment: number
  noInterestPayment: number
  cutDate: string
  onPay: () => void
}
export function CreditCardDetail({
  used,
  limit,
  paymentDue,
  minPayment,
  noInterestPayment,
  cutDate,
  onPay,
}: CreditCardDetailProps) {
  const percentage = Math.round((used / limit) * 100)
  const available = limit - used
  const getStatusColor = (pct: number) => {
    if (pct < 30) return 'text-status-success stroke-status-success'
    if (pct < 70) return 'text-status-warning stroke-status-warning'
    if (pct < 85) return 'text-orange-500 stroke-orange-500'
    return 'text-status-alert stroke-status-alert'
  }
  // Circle calculations
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Usage Circle */}
      <Card className="flex flex-col items-center justify-center p-6">
        <h3 className="text-banorte-gray font-medium text-sm mb-4 uppercase tracking-wider">
          Uso de Crédito
        </h3>

        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${getStatusColor(percentage).split(' ')[1]} transition-all duration-1000 ease-out`}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span
              className={`text-4xl font-display font-bold ${getStatusColor(percentage).split(' ')[0]}`}
            >
              {percentage}%
            </span>
            <span className="text-xs text-gray-400 font-medium">utilizado</span>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Límite de crédito</span>
            <span className="font-bold text-banorte-dark">
              ${limit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Disponible</span>
            <span className="font-bold text-status-success">
              ${available.toLocaleString()}
            </span>
          </div>
        </div>

        {percentage > 80 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-status-alert bg-red-50 px-3 py-2 rounded-lg w-full">
            <AlertCircle size={16} />
            <span>Estás cerca de tu límite de crédito</span>
          </div>
        )}
      </Card>

      {/* Payment Info */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-banorte-dark">Información de Pago</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-banorte-gray">
              Corte: {cutDate}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">
                Pago para no generar intereses
              </p>
              <p className="text-2xl font-bold text-banorte-dark">
                ${noInterestPayment.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Pago Mínimo</p>
                <p className="text-lg font-bold text-banorte-gray">
                  ${minPayment.toLocaleString()}
                </p>
              </div>
              <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 mb-1">Fecha Límite</p>
                <div className="flex items-center gap-1 text-banorte-red font-bold">
                  <Calendar size={16} />
                  <span>{paymentDue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onPay} fullWidth className="mt-auto">
          Programar Pago
        </Button>
      </Card>
    </div>
  )
}

```
```components/cards/DebitCardDetail.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Wallet, ArrowRight, TrendingUp } from 'lucide-react'
interface DebitCardDetailProps {
  available: number
  accountName: string
}
export function DebitCardDetail({
  available,
  accountName,
}: DebitCardDetailProps) {
  return (
    <Card className="mb-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-banorte-gray">{accountName}</p>
            <p className="text-3xl font-bold text-banorte-dark">
              ${available.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            <TrendingUp size={16} className="mr-2" />
            Ver Rendimientos
          </Button>
          <Button className="flex-1 md:flex-none">
            Transferir
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

```
```components/cards/SmartRecommendations.tsx
import React from 'react'
import { Card } from '../ui/Card'
import {
  Sparkles,
  Fuel,
  AlertTriangle,
  PiggyBank,
  ShoppingBag,
} from 'lucide-react'
interface Recommendation {
  id: string
  type: 'opportunity' | 'warning' | 'saving' | 'promo'
  title: string
  description: string
  icon: React.ReactNode
  color: string
}
export function SmartRecommendations() {
  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Cashback en Gasolina',
      description:
        'Usa esta tarjeta hoy para obtener 5% de cashback en gasolineras.',
      icon: <Fuel size={20} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Uso Elevado',
      description: 'Evita compras grandes, ya has usado el 85% de tu crédito.',
      icon: <AlertTriangle size={20} />,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: '3',
      type: 'saving',
      title: 'Ahorra Intereses',
      description: 'Puedes ahorrar $450 pagando el total antes del día 15.',
      icon: <PiggyBank size={20} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: '4',
      type: 'promo',
      title: 'Meses Sin Intereses',
      description: 'Aprovecha hasta 12 MSI en Amazon con esta tarjeta.',
      icon: <ShoppingBag size={20} />,
      color: 'bg-purple-100 text-purple-600',
    },
  ]
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">
          Recomendaciones Inteligentes
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} hoverEffect className="h-full">
            <div
              className={`w-10 h-10 rounded-lg ${rec.color} flex items-center justify-center mb-3`}
            >
              {rec.icon}
            </div>
            <h4 className="font-bold text-sm text-banorte-dark mb-1">
              {rec.title}
            </h4>
            <p className="text-xs text-banorte-gray leading-relaxed">
              {rec.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

```
```components/cards/UsageStrategy.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react'
export function UsageStrategy() {
  const days = Array.from(
    {
      length: 7,
    },
    (_, i) => i + 10,
  ) // Mock days 10-16
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark">
          Estrategia de Uso Óptimo
        </h3>
        <span className="text-xs text-banorte-gray">Noviembre 2024</span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-gray-400 uppercase mb-2"
          >
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const isCutDate = day === 15
          const isPaymentDate = day === 12
          const isGoodDay = day > 15
          return (
            <div
              key={day}
              className={`
                p-2 rounded-lg border text-sm relative h-20 flex flex-col items-center justify-between
                ${isCutDate ? 'bg-red-50 border-red-200' : ''}
                ${isPaymentDate ? 'bg-yellow-50 border-yellow-200' : ''}
                ${isGoodDay ? 'bg-green-50 border-green-200' : 'border-gray-100'}
              `}
            >
              <span className="font-bold text-banorte-dark">{day}</span>

              {isCutDate && (
                <div className="text-[10px] leading-tight text-banorte-red font-medium">
                  Corte
                </div>
              )}

              {isPaymentDate && (
                <div className="text-[10px] leading-tight text-yellow-700 font-medium">
                  Pagar
                </div>
              )}

              {isGoodDay && (
                <div className="text-[10px] leading-tight text-green-700 font-medium">
                  Ideal
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-sm text-blue-800">
        <span className="text-lg">💡</span>
        <p>
          <strong>Tip de Norma:</strong> Tu fecha de corte es el 15. Si realizas
          tus compras grandes a partir del día 16, tendrás hasta 50 días para
          pagarlas sin intereses.
        </p>
      </div>
    </Card>
  )
}

```
```components/cards/BenefitsSection.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Gift, Star, Tag } from 'lucide-react'
export function BenefitsSection() {
  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">
          Beneficios y Recompensas
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={16} />
              <span className="font-medium text-sm">Puntos Banorte</span>
            </div>
            <span className="font-bold text-banorte-dark">12,450 pts</span>
          </div>
          <ProgressBar value={12450} max={20000} height="sm" color="warning" />
          <p className="text-xs text-gray-500">
            Te faltan 7,550 pts para un boleto de avión nacional.
          </p>
        </div>

        {/* Cashback */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tag className="text-green-500" size={16} />
              <span className="font-medium text-sm">Cashback Acumulado</span>
            </div>
            <span className="font-bold text-banorte-dark">$845.00</span>
          </div>
          <ProgressBar value={845} max={1000} height="sm" color="success" />
          <p className="text-xs text-gray-500">
            Disponible para usar en tu próxima compra.
          </p>
        </div>

        {/* Active Benefits */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-xs font-bold text-banorte-gray uppercase mb-2">
            Beneficios Activos
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>5% Cashback en Gasolina</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>3% en Supermercados</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Acceso a Salas VIP (2 pases)</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

```
```components/cards/PaymentModal.tsx
import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Calendar, CreditCard, ArrowRight } from 'lucide-react'
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  cardName: string
  noInterestAmount: number
  minAmount: number
}
export function PaymentModal({
  isOpen,
  onClose,
  cardName,
  noInterestAmount,
  minAmount,
}: PaymentModalProps) {
  const [amountType, setAmountType] = useState<'total' | 'min' | 'other'>(
    'total',
  )
  const [customAmount, setCustomAmount] = useState('')
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Programar Pago">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-3">
            <CreditCard className="text-banorte-red" />
            <div>
              <p className="text-xs text-gray-500">Tarjeta destino</p>
              <p className="font-bold text-banorte-dark">{cardName}</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300" />
          <div className="text-right">
            <p className="text-xs text-gray-500">Cuenta origen</p>
            <p className="font-bold text-banorte-dark">Nómina ****3194</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-3">
            Monto a pagar
          </label>
          <div className="space-y-3">
            <button
              onClick={() => setAmountType('total')}
              className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${amountType === 'total' ? 'border-banorte-red bg-red-50 ring-1 ring-banorte-red' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-sm font-medium">
                Para no generar intereses
              </span>
              <span className="font-bold text-banorte-dark">
                ${noInterestAmount.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => setAmountType('min')}
              className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${amountType === 'min' ? 'border-banorte-red bg-red-50 ring-1 ring-banorte-red' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-sm font-medium">Pago mínimo</span>
              <span className="font-bold text-banorte-dark">
                ${minAmount.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => setAmountType('other')}
              className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${amountType === 'other' ? 'border-banorte-red bg-red-50 ring-1 ring-banorte-red' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-sm font-medium">Otro monto</span>
              {amountType === 'other' ? (
                <input
                  type="number"
                  autoFocus
                  placeholder="0.00"
                  className="w-32 text-right bg-transparent border-b border-banorte-red focus:outline-none font-bold"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              ) : (
                <span className="text-gray-400">Ingresar cantidad</span>
              )}
            </button>
          </div>
        </div>

        <Input
          label="Fecha de pago"
          type="date"
          defaultValue="2024-11-15"
          icon={<Calendar size={18} />}
        />

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-banorte-red focus:ring-banorte-red"
            />
            <span className="text-sm text-banorte-dark">
              Hacer pago recurrente cada mes
            </span>
          </label>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
          <p>
            <strong>Impacto en presupuesto:</strong> Este pago representa el 41%
            de tu ingreso disponible actual.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Confirmar Pago
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```components/cards/TransactionList.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Search, Filter, AlertTriangle } from 'lucide-react'
export function TransactionList() {
  const transactions = [
    {
      id: 1,
      name: 'Uber Eats',
      date: 'Hoy, 2:30 PM',
      amount: 245.0,
      category: 'Comida',
      icon: '🍔',
    },
    {
      id: 2,
      name: 'Netflix',
      date: 'Ayer',
      amount: 199.0,
      category: 'Suscripciones',
      icon: '🎬',
    },
    {
      id: 3,
      name: 'Gasolinera Shell',
      date: '14 Nov',
      amount: 850.0,
      category: 'Transporte',
      icon: '⛽',
    },
    {
      id: 4,
      name: 'Walmart Supercenter',
      date: '12 Nov',
      amount: 2450.0,
      category: 'Supermercado',
      icon: '🛒',
    },
    {
      id: 5,
      name: 'Amazon MX',
      date: '10 Nov',
      amount: 1299.0,
      category: 'Compras',
      icon: '📦',
    },
  ]
  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h3 className="font-bold text-banorte-dark">
          Historial de Transacciones
        </h3>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar cargos..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-1 focus:ring-banorte-red focus:outline-none"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                {tx.icon}
              </div>
              <div>
                <p className="font-medium text-sm text-banorte-dark">
                  {tx.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{tx.date}</span>
                  <span>•</span>
                  <span>{tx.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-banorte-dark">
                -${tx.amount.toFixed(2)}
              </p>
              <button className="text-[10px] text-banorte-red opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center justify-end gap-1 mt-1">
                <AlertTriangle size={10} />
                Disputar cargo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-banorte-red font-medium hover:underline">
          Ver todos los movimientos
        </button>
      </div>
    </Card>
  )
}

```
```components/cards/CardHealthScore.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { TrendingUp, ShieldCheck } from 'lucide-react'
export function CardHealthScore() {
  const score = 85
  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-white border-green-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#6CC04A"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="175"
                strokeDashoffset={175 - (score / 100) * 175}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-green-700">
              {score}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-banorte-dark flex items-center gap-2">
              Salud de Tarjetas
              <ShieldCheck size={16} className="text-green-600" />
            </h3>
            <p className="text-xs text-banorte-gray">
              Tu uso de crédito es saludable. ¡Sigue así!
            </p>
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="flex items-center gap-1 text-green-600 text-sm font-bold justify-end">
            <TrendingUp size={16} />
            <span>+5 pts</span>
          </div>
          <p className="text-xs text-gray-500">vs mes anterior</p>
        </div>
      </div>
    </Card>
  )
}

```
```pages/CardsModule.tsx
import React, { useState } from 'react'
import { CardCarousel } from '../components/cards/CardCarousel'
import { CreditCardDetail } from '../components/cards/CreditCardDetail'
import { DebitCardDetail } from '../components/cards/DebitCardDetail'
import { SmartRecommendations } from '../components/cards/SmartRecommendations'
import { UsageStrategy } from '../components/cards/UsageStrategy'
import { BenefitsSection } from '../components/cards/BenefitsSection'
import { TransactionList } from '../components/cards/TransactionList'
import { CardHealthScore } from '../components/cards/CardHealthScore'
import { PaymentModal } from '../components/cards/PaymentModal'
import { Button } from '../components/ui/Button'
import { Plus } from 'lucide-react'
export function CardsModule() {
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const cards = [
    {
      id: '1',
      type: 'credit' as const,
      name: 'Banorte Oro',
      number: '**** 4582',
      network: 'mastercard' as const,
      balance: 12450,
      limit: 30000,
      color: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
    },
    {
      id: '2',
      type: 'credit' as const,
      name: 'Banorte Platinum',
      number: '**** 7821',
      network: 'visa' as const,
      balance: 25500,
      limit: 50000,
      color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    },
    {
      id: '3',
      type: 'debit' as const,
      name: 'Banorte Débito',
      number: '**** 3194',
      network: 'visa' as const,
      balance: 8450,
      color: 'bg-gradient-to-br from-red-600 to-red-800',
    },
  ]
  const activeCard = cards[activeCardIndex]
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Mis Tarjetas
          </h1>
          <p className="text-banorte-gray">
            Gestiona tus tarjetas y optimiza tu crédito
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Plus size={16} className="mr-2" />
          Agregar Tarjeta
        </Button>
      </div>

      <CardCarousel
        cards={cards}
        activeCardIndex={activeCardIndex}
        onCardChange={setActiveCardIndex}
      />

      <CardHealthScore />

      {activeCard.type === 'credit' ? (
        <>
          <CreditCardDetail
            used={activeCard.balance}
            limit={activeCard.limit || 0}
            paymentDue="15 Nov"
            minPayment={450}
            noInterestPayment={activeCard.balance}
            cutDate="30 Oct"
            onPay={() => setIsPaymentModalOpen(true)}
          />
          <SmartRecommendations />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsageStrategy />
            <BenefitsSection />
          </div>
        </>
      ) : (
        <DebitCardDetail
          available={activeCard.balance}
          accountName="Cuenta de Nómina"
        />
      )}

      <TransactionList />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cardName={activeCard.name}
        noInterestAmount={activeCard.balance}
        minAmount={450}
      />
    </div>
  )
}

```
```components/debt/DebtDashboard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { TrendingDown, Calendar, DollarSign, ArrowDown } from 'lucide-react'
export function DebtDashboard() {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-banorte-gray">
            <DollarSign size={20} />
            <h2 className="text-lg font-bold font-display">Total Adeudado</h2>
          </div>

          <div>
            <p className="text-4xl font-bold text-banorte-dark mb-1">$85,000</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center text-status-success font-bold bg-green-50 px-2 py-0.5 rounded">
                <ArrowDown size={14} className="mr-1" />
                -$15,000
              </span>
              <span className="text-gray-500">desde que iniciaste</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">
                Fecha libre de deudas
              </p>
              <div className="flex items-center gap-2 font-bold text-banorte-dark">
                <Calendar size={16} className="text-banorte-red" />
                Marzo 2027
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Ahorro proyectado</p>
              <div className="flex items-center gap-2 font-bold text-status-success">
                <TrendingDown size={16} />
                $12,450
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Progreso general</span>
            <span className="font-bold text-banorte-dark">15% pagado</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full w-[15%]" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-500">Deudas activas</p>
              <p className="font-bold text-banorte-dark text-lg">4</p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-500">Tasa promedio</p>
              <p className="font-bold text-orange-600 text-lg">29.2%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

```
```components/debt/DebtCard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import {
  CreditCard,
  Car,
  Briefcase,
  ShoppingBag,
  AlertCircle,
  MoreVertical,
} from 'lucide-react'
interface DebtCardProps {
  type: 'credit' | 'auto' | 'personal' | 'store'
  creditor: string
  amount: number
  rate: number
  minPayment: number
  recPayment: number
  dueDate: string
  progress: number
  priority: 'high' | 'medium' | 'low'
  onViewDetails: () => void
}
export function DebtCard({
  type,
  creditor,
  amount,
  rate,
  minPayment,
  recPayment,
  dueDate,
  progress,
  priority,
  onViewDetails,
}: DebtCardProps) {
  const icons = {
    credit: <CreditCard size={20} />,
    auto: <Car size={20} />,
    personal: <Briefcase size={20} />,
    store: <ShoppingBag size={20} />,
  }
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  }
  const rateColor =
    rate > 30
      ? 'text-banorte-red font-bold'
      : rate > 15
        ? 'text-orange-600'
        : 'text-green-600'
  return (
    <Card
      hoverEffect
      className="relative group cursor-pointer"
      onClick={onViewDetails}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg text-banorte-gray border border-gray-100">
            {icons[type]}
          </div>
          <div>
            <h3 className="font-bold text-banorte-dark text-sm">{creditor}</h3>
            <p className="text-xs text-gray-500">
              {type === 'credit'
                ? 'Tarjeta de Crédito'
                : type === 'auto'
                  ? 'Préstamo Automotriz'
                  : type === 'personal'
                    ? 'Crédito Personal'
                    : 'Tarjeta Departamental'}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded border ${priorityColors[priority]}`}
        >
          {priority === 'high'
            ? 'ALTA PRIORIDAD'
            : priority === 'medium'
              ? 'MEDIA PRIORIDAD'
              : 'BAJA PRIORIDAD'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Monto actual</p>
            <p className="text-xl font-bold text-banorte-dark">
              ${amount.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Tasa Anual</p>
            <p className={`text-sm ${rateColor}`}>{rate}% APR</p>
          </div>
        </div>

        <ProgressBar
          value={progress}
          max={100}
          height="sm"
          color={priority === 'high' ? 'alert' : 'primary'}
        />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
            <p className="text-gray-500 mb-1">Pago Mínimo</p>
            <p className="font-medium text-banorte-dark">
              ${minPayment.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-2 rounded border border-green-100">
            <p className="text-green-600 mb-1">Recomendado</p>
            <p className="font-bold text-green-700">
              ${recPayment.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <AlertCircle
            size={12}
            className={
              priority === 'high' ? 'text-banorte-red' : 'text-gray-400'
            }
          />
          <span>Vence: {dueDate}</span>
        </div>
        <button className="text-banorte-red font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalles
        </button>
      </div>
    </Card>
  )
}

```
```components/debt/PaymentStrategy.tsx
import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Snowflake, TrendingDown, Check, Info } from 'lucide-react'
export function PaymentStrategy() {
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>(
    'avalanche',
  )
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-banorte-dark">
            Estrategia de Pago
          </h2>
          <p className="text-sm text-banorte-gray">
            Compara y selecciona el método ideal para ti
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Snowball Card */}
        <Card
          className={`cursor-pointer transition-all border-2 ${strategy === 'snowball' ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent hover:border-gray-200'}`}
          onClick={() => setStrategy('snowball')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Snowflake size={24} />
              </div>
              <div>
                <h3 className="font-bold text-banorte-dark">Bola de Nieve</h3>
                <p className="text-xs text-gray-500">Motivación psicológica</p>
              </div>
            </div>
            {strategy === 'snowball' && (
              <div className="bg-blue-500 text-white p-1 rounded-full">
                <Check size={16} />
              </div>
            )}
          </div>

          <p className="text-sm text-banorte-gray mb-4">
            Paga primero las deudas más pequeñas para ganar impulso y motivación
            con victorias rápidas.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ahorro en intereses</span>
              <span className="font-medium text-banorte-dark">$10,200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tiempo total</span>
              <span className="font-medium text-banorte-dark">41 meses</span>
            </div>
          </div>

          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
            <div className="w-1/4 bg-blue-300" />
            <div className="w-1/4 bg-blue-400" />
            <div className="w-1/4 bg-blue-500" />
            <div className="w-1/4 bg-blue-600" />
          </div>
        </Card>

        {/* Avalanche Card */}
        <Card
          className={`cursor-pointer transition-all border-2 ${strategy === 'avalanche' ? 'border-green-500 ring-4 ring-green-50' : 'border-transparent hover:border-gray-200'}`}
          onClick={() => setStrategy('avalanche')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <div>
                <h3 className="font-bold text-banorte-dark">Avalancha</h3>
                <p className="text-xs text-gray-500">
                  Máximo ahorro financiero
                </p>
              </div>
            </div>
            {strategy === 'avalanche' && (
              <div className="bg-green-500 text-white p-1 rounded-full">
                <Check size={16} />
              </div>
            )}
          </div>

          <p className="text-sm text-banorte-gray mb-4">
            Paga primero las deudas con mayor interés para minimizar el costo
            total y salir antes.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ahorro en intereses</span>
              <span className="font-bold text-green-600">
                $12,450 (+$2,250)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tiempo total</span>
              <span className="font-bold text-green-600">
                38 meses (-3 meses)
              </span>
            </div>
          </div>

          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
            <div className="w-1/3 bg-green-600" />
            <div className="w-1/4 bg-green-500" />
            <div className="w-1/4 bg-green-400" />
            <div className="w-[16%] bg-green-300" />
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
        <Info className="text-blue-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-blue-800">
            Recomendación de Norma
          </p>
          <p className="text-sm text-blue-600">
            Basado en tus altas tasas de interés (42% en Banorte Oro), el método{' '}
            <strong>Avalancha</strong> te ahorrará $2,250 y te liberará 3 meses
            antes.
          </p>
        </div>
      </div>
    </div>
  )
}

```
```components/debt/DebtDetailModal.tsx
import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { CreditCard, Download, Calendar, DollarSign } from 'lucide-react'
interface DebtDetailModalProps {
  isOpen: boolean
  onClose: () => void
}
export function DebtDetailModal({ isOpen, onClose }: DebtDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'info' | 'amortization' | 'history' | 'docs'
  >('info')
  const amortizationData = [
    {
      month: 'Nov 2024',
      payment: 1200,
      capital: 765,
      interest: 435,
      balance: 11685,
    },
    {
      month: 'Dic 2024',
      payment: 1200,
      capital: 792,
      interest: 408,
      balance: 10893,
    },
    {
      month: 'Ene 2025',
      payment: 1200,
      capital: 820,
      interest: 380,
      balance: 10073,
    },
    {
      month: 'Feb 2025',
      payment: 1200,
      capital: 849,
      interest: 351,
      balance: 9224,
    },
    {
      month: 'Mar 2025',
      payment: 1200,
      capital: 878,
      interest: 322,
      balance: 8346,
    },
  ]
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Deuda: Banorte Oro"
      maxWidth="lg"
    >
      <div className="flex gap-4 border-b border-gray-100 mb-6 overflow-x-auto">
        {['info', 'amortization', 'history', 'docs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`
              pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab ? 'text-banorte-red border-b-2 border-banorte-red' : 'text-gray-500 hover:text-banorte-dark'}
            `}
          >
            {tab === 'info'
              ? 'Información'
              : tab === 'amortization'
                ? 'Amortización'
                : tab === 'history'
                  ? 'Historial'
                  : 'Documentos'}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Monto Actual</p>
              <p className="text-2xl font-bold text-banorte-dark">$12,450</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Tasa de Interés</p>
              <p className="text-2xl font-bold text-banorte-red">42% APR</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500">Acreedor</p>
              <p className="font-medium text-banorte-dark">Banorte</p>
            </div>
            <div>
              <p className="text-gray-500">Tipo</p>
              <p className="font-medium text-banorte-dark">
                Tarjeta de Crédito
              </p>
            </div>
            <div>
              <p className="text-gray-500">Pago Mensual</p>
              <p className="font-medium text-banorte-dark">$1,200</p>
            </div>
            <div>
              <p className="text-gray-500">Próximo Pago</p>
              <p className="font-medium text-banorte-dark">15 Nov 2024</p>
            </div>
            <div>
              <p className="text-gray-500">Meses Restantes</p>
              <p className="font-medium text-banorte-dark">14 meses</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha Inicio</p>
              <p className="font-medium text-banorte-dark">Enero 2023</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'amortization' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Mes</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Capital</th>
                  <th className="px-4 py-3">Interés</th>
                  <th className="px-4 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {amortizationData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-banorte-dark">
                      {row.month}
                    </td>
                    <td className="px-4 py-3">${row.payment}</td>
                    <td className="px-4 py-3 text-green-600">${row.capital}</td>
                    <td className="px-4 py-3 text-orange-600">
                      ${row.interest}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      ${row.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" fullWidth size="sm">
            <Download size={16} className="mr-2" />
            Descargar tabla completa
          </Button>
        </div>
      )}

      <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cerrar
        </Button>
        <Button fullWidth>Hacer Pago Extra</Button>
      </div>
    </Modal>
  )
}

```
```components/debt/PaymentSimulator.tsx
import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react'
export function PaymentSimulator() {
  const [extraAmount, setExtraAmount] = useState(500)
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('monthly')
  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-blue-600" size={20} />
        <div>
          <h3 className="font-bold text-banorte-dark">
            Simulador de Pagos Extras
          </h3>
          <p className="text-xs text-banorte-gray">
            Descubre cuánto puedes ahorrar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Monto extra a pagar:{' '}
              <span className="font-bold text-blue-600">${extraAmount}</span>
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={extraAmount}
              onChange={(e) => setExtraAmount(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$0</span>
              <span>$2,500</span>
              <span>$5,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Frecuencia
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFrequency('once')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${frequency === 'once' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                Una vez
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${frequency === 'monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Aplicar a deuda
            </label>
            <select className="w-full p-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option>Banorte Oro (Recomendado)</option>
              <option>BBVA Personal</option>
              <option>Liverpool</option>
              <option>Santander Auto</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-banorte-dark mb-4 text-sm uppercase tracking-wider">
            Resultados
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Tiempo de pago</span>
              <div className="text-right">
                <p className="font-bold text-banorte-dark line-through text-xs text-gray-400">
                  14 meses
                </p>
                <p className="font-bold text-green-600 flex items-center gap-1">
                  10 meses{' '}
                  <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded">
                    -4 meses
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Intereses totales</span>
              <div className="text-right">
                <p className="font-bold text-banorte-dark line-through text-xs text-gray-400">
                  $4,350
                </p>
                <p className="font-bold text-green-600 flex items-center gap-1">
                  $1,750{' '}
                  <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded">
                    Ahorras $2,600
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Fecha libre</span>
              <div className="text-right">
                <p className="font-bold text-banorte-dark line-through text-xs text-gray-400">
                  Ene 2026
                </p>
                <p className="font-bold text-green-600">Sep 2025</p>
              </div>
            </div>

            <Button
              fullWidth
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Programar este pago
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

```
```components/debt/NormaRecommendations.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Sparkles, Scissors, ArrowRight } from 'lucide-react'
export function NormaRecommendations() {
  return (
    <Card className="mb-6 border-l-4 border-l-banorte-red">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-50 text-banorte-red rounded-full">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">
            Recomendación de Norma
          </h3>
          <p className="text-sm text-banorte-gray mb-4">
            He analizado tus gastos y encontré una oportunidad para liberar{' '}
            <strong className="text-banorte-dark">$1,200 mensuales</strong> que
            podrías destinar a tu deuda de Banorte Oro.
          </p>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Scissors size={16} className="text-gray-400" />
                <span>Recortar gastos hormiga</span>
              </div>
              <span className="font-bold text-green-600">+$450</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Scissors size={16} className="text-gray-400" />
                <span>Reducir salidas a restaurantes</span>
              </div>
              <span className="font-bold text-green-600">+$750</span>
            </div>
          </div>

          <button className="text-sm font-bold text-banorte-red flex items-center gap-1 hover:underline">
            Aplicar recomendaciones a presupuesto <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  )
}

```
```components/debt/CreditHealthScore.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react'
export function CreditHealthScore() {
  const score = 650 // Score crediticio simulado
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark flex items-center gap-2">
          <Shield size={18} className="text-blue-600" />
          Score Crediticio
        </h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
          Actualizado hoy
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#FFA400"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251"
              strokeDashoffset={251 - (65 / 100) * 251}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold text-banorte-dark">{score}</span>
            <span className="text-[10px] text-status-warning font-bold">
              Regular
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Promedio Nacional</span>
            <span className="font-medium text-banorte-dark">680</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gray-400 h-2 w-[68%]" />
          </div>
          <p className="text-xs text-banorte-gray">
            Tu score ha mejorado{' '}
            <strong className="text-green-600">+12 puntos</strong> este mes
            gracias a tus pagos puntuales.
          </p>
        </div>
      </div>
    </Card>
  )
}

```
```components/debt/PaymentAlerts.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Calendar, Bell, AlertCircle } from 'lucide-react'
export function PaymentAlerts() {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark flex items-center gap-2">
          <Bell size={18} className="text-banorte-red" />
          Próximos Vencimientos
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="bg-white p-2 rounded text-center min-w-[50px]">
            <span className="block text-xs text-red-600 font-bold uppercase">
              Nov
            </span>
            <span className="block text-lg font-bold text-banorte-dark">
              10
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-banorte-dark">BBVA Personal</p>
            <p className="text-xs text-red-600 font-medium">Vence en 2 días</p>
          </div>
          <p className="font-bold text-banorte-dark">$850</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="bg-white p-2 rounded text-center min-w-[50px]">
            <span className="block text-xs text-gray-500 font-bold uppercase">
              Nov
            </span>
            <span className="block text-lg font-bold text-banorte-dark">
              15
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-banorte-dark">Banorte Oro</p>
            <p className="text-xs text-gray-500">Vence en 7 días</p>
          </div>
          <p className="font-bold text-banorte-dark">$450</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="bg-white p-2 rounded text-center min-w-[50px]">
            <span className="block text-xs text-gray-500 font-bold uppercase">
              Nov
            </span>
            <span className="block text-lg font-bold text-banorte-dark">
              20
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-banorte-dark">
              Santander Auto
            </p>
            <p className="text-xs text-gray-500">Vence en 12 días</p>
          </div>
          <p className="font-bold text-banorte-dark">$1,800</p>
        </div>
      </div>
    </Card>
  )
}

```
```components/debt/AddDebtModal.tsx
import React from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
interface AddDebtModalProps {
  isOpen: boolean
  onClose: () => void
}
export function AddDebtModal({ isOpen, onClose }: AddDebtModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Deuda">
      <div className="space-y-4">
        <Input
          label="Acreedor / Institución"
          placeholder="Ej. Banco, Tienda..."
        />

        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-1">
            Tipo de Deuda
          </label>
          <select className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-banorte-red focus:outline-none">
            <option>Tarjeta de Crédito</option>
            <option>Préstamo Personal</option>
            <option>Crédito Automotriz</option>
            <option>Hipoteca</option>
            <option>Otro</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Monto actual" type="number" placeholder="$0.00" />
          <Input
            label="Tasa de interés (Anual)"
            type="number"
            placeholder="%"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Pago mínimo mensual"
            type="number"
            placeholder="$0.00"
          />
          <Input label="Día de pago" type="number" placeholder="Ej. 15" />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
          <p>
            Al registrar esta deuda, Norma generará automáticamente un plan de
            amortización y sugerencias de pago.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Registrar Deuda
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```pages/DebtModule.tsx
import React, { useState } from 'react'
import { DebtDashboard } from '../components/debt/DebtDashboard'
import { DebtCard } from '../components/debt/DebtCard'
import { PaymentStrategy } from '../components/debt/PaymentStrategy'
import { PaymentSimulator } from '../components/debt/PaymentSimulator'
import { NormaRecommendations } from '../components/debt/NormaRecommendations'
import { CreditHealthScore } from '../components/debt/CreditHealthScore'
import { PaymentAlerts } from '../components/debt/PaymentAlerts'
import { DebtDetailModal } from '../components/debt/DebtDetailModal'
import { AddDebtModal } from '../components/debt/AddDebtModal'
import { Button } from '../components/ui/Button'
import { Plus } from 'lucide-react'
export function DebtModule() {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Gestión de Deudas
          </h1>
          <p className="text-banorte-gray">
            Toma el control y libérate de deudas más rápido
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} className="mr-2" />
          Registrar Deuda
        </Button>
      </div>

      <DebtDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Strategy & List */}
        <div className="lg:col-span-8 space-y-8">
          <PaymentStrategy />

          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Tus Deudas Priorizadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DebtCard
                type="credit"
                creditor="Banorte Oro"
                amount={12450}
                rate={42}
                minPayment={450}
                recPayment={1200}
                dueDate="15 Nov"
                progress={35}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="store"
                creditor="Liverpool"
                amount={9550}
                rate={35}
                minPayment={350}
                recPayment={800}
                dueDate="25 Nov"
                progress={20}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="personal"
                creditor="BBVA Personal"
                amount={18000}
                rate={28}
                minPayment={850}
                recPayment={1500}
                dueDate="10 Nov"
                progress={40}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="auto"
                creditor="Santander Auto"
                amount={45000}
                rate={12}
                minPayment={1800}
                recPayment={2000}
                dueDate="20 Nov"
                progress={60}
                priority="medium"
                onViewDetails={() => setIsDetailOpen(true)}
              />
            </div>
          </div>

          <PaymentSimulator />
        </div>

        {/* Sidebar - Recommendations & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <NormaRecommendations />
          <PaymentAlerts />
          <CreditHealthScore />
        </div>
      </div>

      <DebtDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
      <AddDebtModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  )
}

```
```components/insurance/ProtectionDashboard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Shield, Heart, Car, Home, Briefcase, Activity } from 'lucide-react'
export function ProtectionDashboard() {
  const protectionLevel = 45
  const categories = [
    {
      name: 'Salud',
      icon: <Activity size={16} />,
      status: 'covered',
      color: 'text-green-600 bg-green-50',
    },
    {
      name: 'Vida',
      icon: <Heart size={16} />,
      status: 'partial',
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      name: 'Auto',
      icon: <Car size={16} />,
      status: 'covered',
      color: 'text-green-600 bg-green-50',
    },
    {
      name: 'Hogar',
      icon: <Home size={16} />,
      status: 'none',
      color: 'text-gray-400 bg-gray-100',
    },
    {
      name: 'Desempleo',
      icon: <Briefcase size={16} />,
      status: 'none',
      color: 'text-gray-400 bg-gray-100',
    },
  ]
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-banorte-red stroke-banorte-red'
    if (score < 60) return 'text-orange-500 stroke-orange-500'
    if (score < 80) return 'text-yellow-500 stroke-yellow-500'
    return 'text-status-success stroke-status-success'
  }
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="440"
              strokeDashoffset={440 - (protectionLevel / 100) * 440}
              strokeLinecap="round"
              className={`${getScoreColor(protectionLevel).split(' ')[1]} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={`text-3xl font-bold ${getScoreColor(protectionLevel).split(' ')[0]}`}
            >
              {protectionLevel}%
            </span>
            <span className="text-xs text-gray-500 font-medium">Protegido</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-banorte-dark">
              Nivel de Protección
            </h2>
          </div>
          <p className="text-banorte-gray text-sm mb-6">
            Tienes áreas importantes sin cubrir. Aumentar tu protección te dará
            tranquilidad financiera ante imprevistos.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`flex flex-col items-center p-3 rounded-lg border border-transparent ${cat.color}`}
              >
                <div className="mb-1">{cat.icon}</div>
                <span className="text-xs font-bold">{cat.name}</span>
                <span className="text-[10px] font-medium opacity-80">
                  {cat.status === 'covered'
                    ? 'Cubierto'
                    : cat.status === 'partial'
                      ? 'Parcial'
                      : 'Sin cubrir'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

```
```components/insurance/InsuranceCard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Shield, FileText, Phone, AlertCircle } from 'lucide-react'
interface InsuranceCardProps {
  type: string
  insurer: string
  policyNumber: string
  premium: number
  sumInsured: string
  expiryDate: string
  status: 'active' | 'expiring' | 'expired'
  icon: React.ReactNode
}
export function InsuranceCard({
  type,
  insurer,
  policyNumber,
  premium,
  sumInsured,
  expiryDate,
  status,
  icon,
}: InsuranceCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    expiring: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    expired: 'bg-red-100 text-red-700 border-red-200',
  }
  const statusLabels = {
    active: 'Vigente',
    expiring: 'Por vencer',
    expired: 'Vencido',
  }
  return (
    <Card hoverEffect className="relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg text-banorte-gray border border-gray-100">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-banorte-dark text-sm">{type}</h3>
            <p className="text-xs text-gray-500">{insurer}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded border ${statusColors[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Póliza</span>
          <span className="font-medium text-banorte-dark">{policyNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Suma Asegurada</span>
          <span className="font-medium text-banorte-dark">{sumInsured}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Vigencia</span>
          <span className="font-medium text-banorte-dark">{expiryDate}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="text-gray-500">Prima Anual</span>
          <span className="font-bold text-banorte-dark">
            ${premium.toLocaleString()}
          </span>
        </div>
      </div>

      {status === 'expiring' && (
        <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-4">
          <AlertCircle size={14} />
          <span>Renueva antes del {expiryDate}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" className="px-2 text-xs">
          <FileText size={14} className="mr-1" />
          Póliza
        </Button>
        <Button variant="outline" size="sm" className="px-2 text-xs">
          <Shield size={14} className="mr-1" />
          Reportar
        </Button>
        <Button variant="outline" size="sm" className="px-2 text-xs">
          <Phone size={14} className="mr-1" />
          Contacto
        </Button>
      </div>
    </Card>
  )
}

```
```components/insurance/NeedsEvaluator.tsx
import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Stepper } from '../ui/Stepper'
import { Input } from '../ui/Input'
import { User, Home, Shield, PieChart } from 'lucide-react'
interface NeedsEvaluatorProps {
  isOpen: boolean
  onClose: () => void
}
export function NeedsEvaluator({ isOpen, onClose }: NeedsEvaluatorProps) {
  const [step, setStep] = useState(0)
  const steps = ['Perfil', 'Situación', 'Objetivos', 'Reporte']
  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }
  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <User size={20} />
              <h3>Perfil Personal</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Edad" type="number" placeholder="30" />
              <Input label="Estado Civil" placeholder="Soltero/a" />
            </div>
            <Input
              label="Dependientes Económicos"
              type="number"
              placeholder="0"
            />
            <Input
              label="Ingresos Mensuales"
              type="number"
              placeholder="$0.00"
            />
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <Home size={20} />
              <h3>Situación Actual</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded text-banorte-red" />
                <span>¿Eres propietario de vivienda?</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded text-banorte-red" />
                <span>¿Tienes auto propio?</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded text-banorte-red" />
                <span>¿Tienes deudas significativas?</span>
              </label>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <Shield size={20} />
              <h3>Objetivos de Protección</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona lo que más te preocupa proteger:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                'Proteger ingresos familiares',
                'Cubrir deudas en caso de fallecimiento',
                'Proteger patrimonio (casa/auto)',
                'Gastos médicos mayores',
              ].map((goal) => (
                <button
                  key={goal}
                  className="p-3 text-left border rounded-lg hover:border-banorte-red hover:bg-red-50 transition-colors"
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <PieChart size={20} />
              <h3>Tu Reporte de Necesidades</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">
                Recomendación Principal
              </h4>
              <p className="text-sm text-blue-600">
                Basado en tu perfil, tu prioridad #1 debería ser un{' '}
                <strong>Seguro de Gastos Médicos Mayores</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-500 uppercase">
                Seguros Sugeridos
              </h4>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Gastos Médicos</span>
                <span className="text-banorte-red font-bold">
                  Alta Prioridad
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Seguro de Vida</span>
                <span className="text-yellow-600 font-bold">
                  Media Prioridad
                </span>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluador de Necesidades"
      maxWidth="lg"
    >
      <div className="py-2">
        <Stepper steps={steps} currentStep={step} />

        <div className="min-h-[300px] py-4">{renderStepContent()}</div>

        <div className="flex justify-between pt-4 border-t border-gray-100 mt-4">
          <Button
            variant="secondary"
            onClick={step === 0 ? onClose : handleBack}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          <Button onClick={step === 3 ? onClose : handleNext}>
            {step === 3 ? 'Ver Cotizaciones' : 'Continuar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

```
```components/insurance/InsuranceComparator.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Check, X, Star } from 'lucide-react'
export function InsuranceComparator() {
  const options = [
    {
      name: 'Banorte Esencial',
      price: 850,
      coverage: '500k',
      deductible: '10%',
      rating: 4.5,
      features: [true, true, false, false],
      recommended: false,
    },
    {
      name: 'Banorte Plus',
      price: 1200,
      coverage: '1M',
      deductible: '5%',
      rating: 4.8,
      features: [true, true, true, false],
      recommended: true,
    },
    {
      name: 'Banorte Premium',
      price: 1800,
      coverage: '5M',
      deductible: '3%',
      rating: 4.9,
      features: [true, true, true, true],
      recommended: false,
    },
  ]
  const featuresList = [
    'Cobertura Nacional',
    'Asistencia Vial',
    'Auto Sustituto',
    'Cobertura en EE.UU.',
  ]
  return (
    <Card className="mb-6 overflow-x-auto">
      <h3 className="font-bold text-banorte-dark mb-6">
        Comparativa de Seguros de Auto
      </h3>

      <div className="min-w-[600px]">
        <div className="grid grid-cols-4 gap-4">
          {/* Labels Column */}
          <div className="pt-32 space-y-4">
            <div className="font-medium text-sm text-gray-500">
              Prima Mensual
            </div>
            <div className="font-medium text-sm text-gray-500">
              Suma Asegurada
            </div>
            <div className="font-medium text-sm text-gray-500">Deducible</div>
            <div className="font-medium text-sm text-gray-500">
              Calificación
            </div>
            {featuresList.map((f, i) => (
              <div key={i} className="font-medium text-sm text-gray-500">
                {f}
              </div>
            ))}
          </div>

          {/* Options Columns */}
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={`relative p-4 rounded-xl ${opt.recommended ? 'bg-red-50 border-2 border-banorte-red' : 'bg-gray-50 border border-gray-200'}`}
            >
              {opt.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-banorte-red text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  Mejor Opción
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="font-bold text-banorte-dark mb-2">{opt.name}</h4>
                <Button
                  size="sm"
                  fullWidth
                  variant={opt.recommended ? 'primary' : 'outline'}
                >
                  Cotizar
                </Button>
              </div>

              <div className="space-y-4 text-center">
                <div className="font-bold text-banorte-dark">${opt.price}</div>
                <div className="text-sm">{opt.coverage}</div>
                <div className="text-sm">{opt.deductible}</div>
                <div className="flex justify-center items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {opt.rating}
                </div>
                {opt.features.map((feat, i) => (
                  <div key={i} className="flex justify-center">
                    {feat ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

```
```components/insurance/CoverageCalculator.tsx
import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Calculator, ArrowRight } from 'lucide-react'
export function CoverageCalculator() {
  const [income, setIncome] = useState(25000)
  const [years, setYears] = useState(5)
  const recommended = income * 12 * years
  return (
    <Card className="mb-6 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">
          Calculadora de Cobertura (Vida)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Ingresos Mensuales
            </label>
            <input
              type="range"
              min="10000"
              max="100000"
              step="1000"
              value={income}
              onChange={(e) => setIncome(parseInt(e.target.value))}
              className="w-full accent-banorte-red"
            />
            <p className="text-right font-bold text-banorte-dark">
              ${income.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Años de Protección
            </label>
            <div className="flex gap-2">
              {[3, 5, 10, 15].map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`flex-1 py-2 rounded border text-sm transition-colors ${years === y ? 'bg-banorte-red text-white border-banorte-red' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                  {y} años
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-2">
            Suma Asegurada Recomendada
          </p>
          <p className="text-3xl font-bold text-banorte-dark mb-4">
            ${recommended.toLocaleString()}
          </p>
          <p className="text-xs text-banorte-gray mb-4">
            Esto cubriría los gastos de tu familia por {years} años en caso de
            que faltes.
          </p>
          <button className="text-banorte-red font-bold text-sm flex items-center justify-center gap-1 hover:underline">
            Cotizar esta suma <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  )
}

```
```components/insurance/EducationSection.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { BookOpen, PlayCircle, HelpCircle } from 'lucide-react'
export function EducationSection() {
  const articles = [
    {
      title: '¿Qué es el deducible y coaseguro?',
      type: 'article',
      readTime: '3 min',
    },
    {
      title: 'Mitos sobre los seguros de vida',
      type: 'video',
      readTime: '5 min',
    },
    {
      title: 'Guía para asegurar tu primer auto',
      type: 'article',
      readTime: '4 min',
    },
  ]
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">Educación sobre Seguros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-banorte-gray bg-gray-100 px-2 py-1 rounded">
                {item.type === 'video' ? 'Video' : 'Artículo'}
              </span>
              <span className="text-xs text-gray-400">{item.readTime}</span>
            </div>
            <h4 className="font-bold text-sm text-banorte-dark mb-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-banorte-red font-medium">
              {item.type === 'video' ? (
                <PlayCircle size={14} />
              ) : (
                <BookOpen size={14} />
              )}
              <span>Ver contenido</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="font-bold text-sm text-banorte-dark mb-3 flex items-center gap-2">
          <HelpCircle size={16} /> Preguntas Frecuentes
        </h4>
        <div className="space-y-2">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm">
              <span>¿Puedo cancelar mi seguro en cualquier momento?</span>
              <span className="transition group-open:rotate-180">
                <svg
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-gray-500 mt-3 group-open:animate-fadeIn text-sm">
              Sí, puedes cancelar tu póliza cuando lo desees. Dependiendo de las
              condiciones, podrías recibir un reembolso de la prima no
              devengada.
            </p>
          </details>
        </div>
      </div>
    </Card>
  )
}

```
```components/insurance/NormaInsuranceRecommendation.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react'
export function NormaInsuranceRecommendation() {
  return (
    <Card className="mb-6 border-l-4 border-l-banorte-red bg-red-50/30">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-100 text-banorte-red rounded-full">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">
            Análisis de Norma
          </h3>
          <p className="text-sm text-banorte-gray mb-4">
            He notado que tienes un crédito automotriz activo pero tu seguro de
            auto vence en 15 días. Es crítico renovarlo para proteger tu
            patrimonio.
          </p>

          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-banorte-dark">
                <ShieldAlert size={16} className="text-orange-500" />
                <span>Gap detectado: Seguro de Auto</span>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Alta Prioridad
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Te sugiero cotizar una cobertura amplia que incluya daños
              materiales y robo total.
            </p>
          </div>

          <button className="text-sm font-bold text-banorte-red flex items-center gap-1 hover:underline">
            Ver opciones recomendadas <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  )
}

```
```components/insurance/QuoteModal.tsx
import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Car, Check } from 'lucide-react'
interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
}
export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [step, setStep] = useState(1)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cotizar Seguro de Auto">
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-banorte-red text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              1
            </div>
            <span className="text-xs mt-1">Datos</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-banorte-red' : 'bg-gray-200'}`}
          />
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-banorte-red text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              2
            </div>
            <span className="text-xs mt-1">Vehículo</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-banorte-red' : 'bg-gray-200'}`}
          />
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-banorte-red text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              3
            </div>
            <span className="text-xs mt-1">Cotización</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Input label="Código Postal" placeholder="00000" />
            <Input label="Edad del conductor" type="number" placeholder="30" />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  className="text-banorte-red"
                  defaultChecked
                />
                <span>Masculino</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  className="text-banorte-red"
                />
                <span>Femenino</span>
              </label>
            </div>
            <Button fullWidth onClick={() => setStep(2)}>
              Siguiente
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input label="Marca" placeholder="Ej. Nissan" />
            <Input label="Modelo" placeholder="Ej. Versa" />
            <Input label="Año" type="number" placeholder="2020" />
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button fullWidth onClick={() => setStep(3)}>
                Cotizar Ahora
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check size={32} />
            </div>
            <h3 className="font-bold text-xl text-banorte-dark">
              ¡Cotización Lista!
            </h3>
            <p className="text-gray-500 text-sm">
              Hemos encontrado 3 opciones para ti desde $850/mes.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-left mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-banorte-dark">
                  Banorte Amplia
                </span>
                <span className="text-banorte-red font-bold">$1,200/mes</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Daños materiales (Deducible 5%)</li>
                <li>• Robo total (Deducible 10%)</li>
                <li>• Responsabilidad Civil 3M</li>
              </ul>
            </div>

            <Button fullWidth onClick={onClose}>
              Ver todas las opciones
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

```
```pages/InsuranceModule.tsx
import React, { useState } from 'react'
import { ProtectionDashboard } from '../components/insurance/ProtectionDashboard'
import { InsuranceCard } from '../components/insurance/InsuranceCard'
import { NeedsEvaluator } from '../components/insurance/NeedsEvaluator'
import { InsuranceComparator } from '../components/insurance/InsuranceComparator'
import { CoverageCalculator } from '../components/insurance/CoverageCalculator'
import { EducationSection } from '../components/insurance/EducationSection'
import { NormaInsuranceRecommendation } from '../components/insurance/NormaInsuranceRecommendation'
import { QuoteModal } from '../components/insurance/QuoteModal'
import { Button } from '../components/ui/Button'
import { Plus, Car, Heart, Activity } from 'lucide-react'
export function InsuranceModule() {
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Centro de Seguros
          </h1>
          <p className="text-banorte-gray">Protege lo que más te importa</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEvaluatorOpen(true)}
          >
            Evaluar Necesidades
          </Button>
          <Button size="sm" onClick={() => setIsQuoteOpen(true)}>
            <Plus size={16} className="mr-2" />
            Cotizar Seguro
          </Button>
        </div>
      </div>

      <ProtectionDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Mis Seguros Actuales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsuranceCard
                type="Seguro de Auto"
                insurer="Banorte Seguros"
                policyNumber="AUT-2024-8592"
                premium={12500}
                sumInsured="Valor Comercial"
                expiryDate="15 Nov 2024"
                status="expiring"
                icon={<Car size={20} />}
              />
              <InsuranceCard
                type="Gastos Médicos"
                insurer="AXA Salud"
                policyNumber="GMM-9921-002"
                premium={24000}
                sumInsured="$5,000,000 MXN"
                expiryDate="20 Ene 2025"
                status="active"
                icon={<Activity size={20} />}
              />
            </div>
          </div>

          <InsuranceComparator />
          <CoverageCalculator />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <NormaInsuranceRecommendation />
          <EducationSection />
        </div>
      </div>

      <NeedsEvaluator
        isOpen={isEvaluatorOpen}
        onClose={() => setIsEvaluatorOpen(false)}
      />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  )
}

```
```components/chat/ChatMessage.tsx
import React from 'react'
import { User, Sparkles } from 'lucide-react'
interface ChatMessageProps {
  message: string
  sender: 'norma' | 'user'
  timestamp: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}
export function ChatMessage({
  message,
  sender,
  timestamp,
  sentiment,
  actions,
}: ChatMessageProps) {
  const isNorma = sender === 'norma'
  return (
    <div
      className={`flex gap-3 mb-6 ${isNorma ? 'justify-start' : 'justify-end'}`}
    >
      {isNorma && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <Sparkles size={16} />
        </div>
      )}

      <div
        className={`max-w-[80%] ${isNorma ? 'items-start' : 'items-end'} flex flex-col`}
      >
        <div
          className={`
            p-4 rounded-2xl shadow-sm relative
            ${isNorma ? 'bg-white text-banorte-dark rounded-tl-none border border-gray-100' : 'bg-gradient-to-br from-banorte-red to-red-600 text-white rounded-tr-none'}
            ${sentiment === 'positive' && isNorma ? 'border-l-4 border-l-green-500' : ''}
            ${sentiment === 'negative' && isNorma ? 'border-l-4 border-l-orange-500' : ''}
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="text-xs font-medium px-3 py-1.5 bg-white border border-gray-200 rounded-full text-banorte-red hover:bg-red-50 transition-colors shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-gray-400 mt-1 px-1">{timestamp}</span>
      </div>

      {!isNorma && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
          <User size={16} />
        </div>
      )}
    </div>
  )
}

```
```components/chat/InsightMessage.tsx
import React from 'react'
import { TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'
import { Sparkles } from 'lucide-react'
interface InsightMessageProps {
  title: string
  description: string
  data?: {
    label: string
    value: string
    trend?: 'up' | 'down'
  }[]
  recommendation: string
  timestamp: string
}
export function InsightMessage({
  title,
  description,
  data,
  recommendation,
  timestamp,
}: InsightMessageProps) {
  return (
    <div className="flex gap-3 mb-6 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
        <Sparkles size={16} />
      </div>

      <div className="max-w-[85%] flex flex-col">
        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Análisis Detectado
            </span>
          </div>

          <div className="p-4">
            <h4 className="font-bold text-banorte-dark mb-2">{title}</h4>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            {data && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {data.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-bold text-banorte-dark">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
              <p className="text-xs font-bold text-green-800 mb-1">
                Recomendación:
              </p>
              <p className="text-sm text-green-700">{recommendation}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-banorte-red text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Aplicar Recomendación
              </button>
              <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{timestamp}</span>
      </div>
    </div>
  )
}

```
```components/chat/ComparisonMessage.tsx
import React from 'react'
import { Sparkles, ArrowUp, ArrowDown } from 'lucide-react'
interface ComparisonMessageProps {
  title: string
  currentMonth: {
    label: string
    value: number
  }
  previousMonth: {
    label: string
    value: number
  }
  insight: string
  timestamp: string
}
export function ComparisonMessage({
  title,
  currentMonth,
  previousMonth,
  insight,
  timestamp,
}: ComparisonMessageProps) {
  const difference = currentMonth.value - previousMonth.value
  const percentChange = Math.round((difference / previousMonth.value) * 100)
  const isImprovement = difference < 0 // Assuming lower spending is better
  return (
    <div className="flex gap-3 mb-6 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
        <Sparkles size={16} />
      </div>

      <div className="max-w-[85%] flex flex-col">
        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-100 shadow-sm overflow-hidden p-4">
          <h4 className="font-bold text-banorte-dark mb-4">{title}</h4>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">
                {previousMonth.label}
              </p>
              <p className="font-medium text-gray-400">
                ${previousMonth.value.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isImprovement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {isImprovement ? (
                  <ArrowDown size={12} />
                ) : (
                  <ArrowUp size={12} />
                )}
                {Math.abs(percentChange)}%
              </div>
              <div className="w-16 h-0.5 bg-gray-100 mt-2" />
            </div>

            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">{currentMonth.label}</p>
              <p className="font-bold text-banorte-dark">
                ${currentMonth.value.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-sm text-banorte-gray italic border-l-2 border-banorte-red pl-3">
            "{insight}"
          </p>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{timestamp}</span>
      </div>
    </div>
  )
}

```
```components/chat/QuickReplyOptions.tsx
import React from 'react'
interface QuickReplyOptionsProps {
  options: string[]
  onSelect: (option: string) => void
}
export function QuickReplyOptions({
  options,
  onSelect,
}: QuickReplyOptionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 px-4">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(option)}
          className="bg-white border border-banorte-red text-banorte-red hover:bg-red-50 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
        >
          {option}
        </button>
      ))}
    </div>
  )
}

```
```components/chat/ChatInput.tsx
import React, { useState } from 'react'
import { Send, Mic, Paperclip } from 'lucide-react'
interface ChatInputProps {
  onSend: (message: string) => void
  isTyping?: boolean
}
export function ChatInput({ onSend, isTyping }: ChatInputProps) {
  const [input, setInput] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSend(input)
      setInput('')
    }
  }
  return (
    <div className="bg-white border-t border-gray-100 p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu duda financiera..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-banorte-red/20 focus:border-banorte-red transition-all"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-banorte-red rounded-full hover:bg-red-50 transition-colors"
          >
            <Mic size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 bg-banorte-red text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          <Send size={20} />
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-400">
          Norma puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  )
}

```
```components/chat/TypingIndicator.tsx
import React from 'react'
import { Sparkles } from 'lucide-react'
export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6 justify-start animate-in fade-in slide-in-from-bottom-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
        <Sparkles size={16} />
      </div>
      <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: '0ms',
          }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: '150ms',
          }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: '300ms',
          }}
        />
      </div>
    </div>
  )
}

```
```components/chat/ChatHistoryModal.tsx
import React from 'react'
import { Modal } from '../ui/Modal'
import { Search, MessageSquare, Calendar } from 'lucide-react'
interface ChatHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}
export function ChatHistoryModal({ isOpen, onClose }: ChatHistoryModalProps) {
  const history = [
    {
      id: 1,
      title: 'Análisis de gastos hormiga',
      date: 'Hoy',
      preview: 'Detecté $1,200 en gastos...',
    },
    {
      id: 2,
      title: 'Plan de ahorro para viaje',
      date: 'Ayer',
      preview: 'Para ahorrar $20,000 necesitas...',
    },
    {
      id: 3,
      title: 'Duda sobre tarjeta Oro',
      date: '10 Nov',
      preview: 'La tasa de interés es del...',
    },
  ]
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Conversaciones"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar en conversaciones..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-banorte-red"
          />
        </div>

        <div className="space-y-2">
          {history.map((chat) => (
            <button
              key={chat.id}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-banorte-dark group-hover:text-banorte-red transition-colors">
                  {chat.title}
                </h4>
                <span className="text-[10px] text-gray-400">{chat.date}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {chat.preview}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

```
```pages/AdvisorModule.tsx
import React, { useEffect, useState, useRef } from 'react'
import { ChatMessage } from '../components/chat/ChatMessage'
import { InsightMessage } from '../components/chat/InsightMessage'
import { ComparisonMessage } from '../components/chat/ComparisonMessage'
import { QuickReplyOptions } from '../components/chat/QuickReplyOptions'
import { ChatInput } from '../components/chat/ChatInput'
import { TypingIndicator } from '../components/chat/TypingIndicator'
import { ChatHistoryModal } from '../components/chat/ChatHistoryModal'
import { Button } from '../components/ui/Button'
import { History, Settings, Sparkles } from 'lucide-react'
export function AdvisorModule() {
  const [messages, setMessages] = useState<any[]>([
    {
      type: 'text',
      message:
        '¡Hola María! 👋 Soy Norma, tu asesora financiera personal. He estado analizando tus finanzas y tengo algunas recomendaciones.',
      sender: 'norma',
      timestamp: '10:30 AM',
      sentiment: 'positive',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])
  const handleSend = (text: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'text',
        message: text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    // Simulate Norma thinking
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Mock response logic
      if (text.toLowerCase().includes('gastos')) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'comparison',
            title: 'Análisis de Gastos Mensuales',
            currentMonth: {
              label: 'Noviembre',
              value: 12450,
            },
            previousMonth: {
              label: 'Octubre',
              value: 14200,
            },
            insight:
              '¡Excelente! Has reducido tus gastos un 12% comparado con el mes anterior. Principalmente en la categoría de Restaurantes.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      } else if (
        text.toLowerCase().includes('ahorro') ||
        text.toLowerCase().includes('ahorrar')
      ) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'insight',
            title: 'Oportunidad de Ahorro Detectada',
            description:
              'He notado que tienes $5,000 en tu cuenta de nómina que no has utilizado en 3 meses.',
            data: [
              {
                label: 'Saldo inactivo',
                value: '$5,000',
              },
              {
                label: 'Rendimiento potencial',
                value: '$450/año',
              },
            ],
            recommendation:
              'Mueve este saldo a tu Pagaré Banorte para generar rendimientos sin riesgo.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'text',
            message:
              'Entiendo. Para darte una mejor respuesta, ¿podrías darme más detalles o elegir una de las opciones sugeridas?',
            sender: 'norma',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      }
    }, 1500)
  }
  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-xl my-4 rounded-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-bold text-banorte-dark flex items-center gap-2">
                Norma
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </h1>
              <p className="text-xs text-gray-500">
                Tu Asesora Financiera Personal
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors"
            >
              <History size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {messages.map((msg, idx) => {
            if (msg.type === 'insight') {
              return <InsightMessage key={idx} {...msg} />
            }
            if (msg.type === 'comparison') {
              return <ComparisonMessage key={idx} {...msg} />
            }
            return <ChatMessage key={idx} {...msg} />
          })}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!isTyping && (
          <QuickReplyOptions
            options={[
              '¿Cómo van mis gastos?',
              'Sugerencias de ahorro',
              'Analizar mis deudas',
              'Revisar presupuesto',
            ]}
            onSelect={handleSend}
          />
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} isTyping={isTyping} />
      </div>

      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  )
}

```
```components/education/EducationHero.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Trophy, Star, ArrowRight } from 'lucide-react'
export function EducationHero() {
  return (
    <Card className="bg-gradient-to-br from-banorte-dark to-gray-800 text-white border-none mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
            <Trophy size={14} className="text-yellow-400" />
            <span>Nivel: Principiante Avanzado</span>
          </div>

          <h1 className="text-3xl font-display font-bold">
            Aprende a Mejorar tu{' '}
            <span className="text-banorte-red">Salud Financiera</span>
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed">
            Has completado el 35% de tu ruta de aprendizaje. Tu próximo objetivo
            es dominar el interés compuesto.
          </p>

          <Button className="bg-white text-banorte-dark hover:bg-gray-100 border-none">
            Continuar Aprendiendo <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 w-full md:w-auto min-w-[280px]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Tu Progreso</span>
            <span className="text-2xl font-bold">35%</span>
          </div>

          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
            <div className="bg-banorte-red h-2 rounded-full w-[35%]" />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-800/50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-yellow-400">3</span>
              <span className="text-[10px] text-gray-400 uppercase">
                Badges
              </span>
            </div>
            <div className="flex-1 bg-gray-800/50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-green-400">12</span>
              <span className="text-[10px] text-gray-400 uppercase">
                Lecciones
              </span>
            </div>
            <div className="flex-1 bg-gray-800/50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-blue-400">850</span>
              <span className="text-[10px] text-gray-400 uppercase">
                Puntos
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

```
```components/education/TopicCard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { ChevronRight } from 'lucide-react'
interface TopicCardProps {
  title: string
  description: string
  progress: number
  lessonsCount: number
  level: string
  icon: React.ReactNode
  color: string
}
export function TopicCard({
  title,
  description,
  progress,
  lessonsCount,
  level,
  icon,
  color,
}: TopicCardProps) {
  return (
    <Card hoverEffect className="group cursor-pointer h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl ${color} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">
          {level}
        </span>
      </div>

      <h3 className="font-bold text-banorte-dark mb-2 group-hover:text-banorte-red transition-colors">
        {title}
      </h3>
      <p className="text-xs text-gray-500 mb-4 flex-1 line-clamp-2">
        {description}
      </p>

      <div className="mt-auto">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{progress}% completado</span>
          <span>{lessonsCount} lecciones</span>
        </div>
        <ProgressBar value={progress} max={100} height="xs" color="primary" />
      </div>
    </Card>
  )
}

```
```components/education/ContentCard.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { PlayCircle, BookOpen, Clock, Star } from 'lucide-react'
interface ContentCardProps {
  type: 'video' | 'article' | 'quiz'
  title: string
  duration: string
  rating: number
  thumbnail: string
  isRecommended?: boolean
}
export function ContentCard({
  type,
  title,
  duration,
  rating,
  thumbnail,
  isRecommended,
}: ContentCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-video shadow-sm">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

        {isRecommended && (
          <div className="absolute top-2 left-2 bg-banorte-red text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            Recomendado
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
          <Clock size={10} />
          {duration}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-banorte-red shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            {type === 'video' ? (
              <PlayCircle size={20} />
            ) : (
              <BookOpen size={20} />
            )}
          </div>
        </div>
      </div>

      <h4 className="font-bold text-sm text-banorte-dark mb-1 line-clamp-2 group-hover:text-banorte-red transition-colors">
        {title}
      </h4>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="capitalize">{type}</span>
        <span>•</span>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={10} fill="currentColor" />
          <span>{rating}</span>
        </div>
      </div>
    </div>
  )
}

```
```components/education/LearningPath.tsx
import React from 'react'
import { Card } from '../ui/Card'
import { Check, Lock, Star } from 'lucide-react'
export function LearningPath() {
  const steps = [
    {
      id: 1,
      title: 'Conceptos Básicos',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Presupuesto Personal',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Fondo de Emergencia',
      status: 'current',
    },
    {
      id: 4,
      title: 'Control de Deudas',
      status: 'locked',
    },
    {
      id: 5,
      title: 'Inversión Inicial',
      status: 'locked',
    },
  ]
  return (
    <Card className="h-full">
      <h3 className="font-bold text-banorte-dark mb-6">
        Tu Ruta de Aprendizaje
      </h3>

      <div className="relative pl-4 space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-100 -z-10" />

        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-4 relative">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10
                ${step.status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${step.status === 'current' ? 'bg-banorte-red text-white ring-4 ring-red-50' : ''}
                ${step.status === 'locked' ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {step.status === 'completed' && <Check size={14} />}
              {step.status === 'current' && (
                <Star size={14} fill="currentColor" />
              )}
              {step.status === 'locked' && <Lock size={14} />}
            </div>

            <div
              className={`flex-1 p-3 rounded-lg border ${step.status === 'current' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}
            >
              <p
                className={`text-sm font-bold ${step.status === 'locked' ? 'text-gray-400' : 'text-banorte-dark'}`}
              >
                {step.title}
              </p>
              {step.status === 'current' && (
                <p className="text-xs text-banorte-red mt-1 font-medium">
                  En progreso
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

```
```components/education/Quiz.tsx
import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { CheckCircle, XCircle } from 'lucide-react'
export function Quiz() {
  const [selected, setSelected] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const question = {
    text: '¿Cuál es la regla básica recomendada para dividir tu presupuesto?',
    options: [
      '80% Gastos / 20% Ahorro',
      '50% Necesidades / 30% Deseos / 20% Ahorro',
      '33% Vivienda / 33% Comida / 33% Ahorro',
      'Gastarlo todo y ahorrar lo que sobre',
    ],
    correct: 1,
  }
  const handleSubmit = () => {
    if (selected !== null) setIsSubmitted(true)
  }
  return (
    <Card className="bg-blue-50 border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Quiz Rápido
        </span>
        <span className="text-xs text-blue-400">Pregunta 1 de 3</span>
      </div>

      <h4 className="font-bold text-banorte-dark mb-4">{question.text}</h4>

      <div className="space-y-2 mb-4">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => !isSubmitted && setSelected(idx)}
            className={`
              w-full text-left p-3 rounded-lg text-sm transition-all border
              ${selected === idx && !isSubmitted ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-transparent hover:bg-white/80'}
              ${isSubmitted && idx === question.correct ? 'bg-green-100 border-green-300 text-green-800' : ''}
              ${isSubmitted && selected === idx && idx !== question.correct ? 'bg-red-100 border-red-300 text-red-800' : ''}
            `}
            disabled={isSubmitted}
          >
            <div className="flex justify-between items-center">
              <span>{opt}</span>
              {isSubmitted && idx === question.correct && (
                <CheckCircle size={16} />
              )}
              {isSubmitted && selected === idx && idx !== question.correct && (
                <XCircle size={16} />
              )}
            </div>
          </button>
        ))}
      </div>

      {!isSubmitted ? (
        <Button
          size="sm"
          fullWidth
          onClick={handleSubmit}
          disabled={selected === null}
        >
          Verificar Respuesta
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-sm font-bold mb-2">
            {selected === question.correct ? '¡Correcto! 🎉' : 'Incorrecto 😅'}
          </p>
          <p className="text-xs text-gray-500">
            La regla 50/30/20 es un estándar financiero para equilibrar tus
            gastos.
          </p>
        </div>
      )}
    </Card>
  )
}

```
```pages/EducationModule.tsx
import React from 'react'
import { EducationHero } from '../components/education/EducationHero'
import { TopicCard } from '../components/education/TopicCard'
import { ContentCard } from '../components/education/ContentCard'
import { LearningPath } from '../components/education/LearningPath'
import { Quiz } from '../components/education/Quiz'
import { Button } from '../components/ui/Button'
import {
  Search,
  Filter,
  Wallet,
  TrendingUp,
  Shield,
  CreditCard,
} from 'lucide-react'
export function EducationModule() {
  const topics = [
    {
      title: 'Presupuesto',
      desc: 'Controla tus gastos y planifica tu dinero',
      progress: 80,
      lessons: 12,
      level: 'Básico',
      icon: <Wallet size={24} />,
      color: 'bg-blue-500',
    },
    {
      title: 'Inversiones',
      desc: 'Haz crecer tu patrimonio a largo plazo',
      progress: 20,
      lessons: 8,
      level: 'Intermedio',
      icon: <TrendingUp size={24} />,
      color: 'bg-green-500',
    },
    {
      title: 'Crédito',
      desc: 'Usa las tarjetas a tu favor',
      progress: 45,
      lessons: 10,
      level: 'Básico',
      icon: <CreditCard size={24} />,
      color: 'bg-purple-500',
    },
    {
      title: 'Seguros',
      desc: 'Protege lo que más te importa',
      progress: 0,
      lessons: 6,
      level: 'Avanzado',
      icon: <Shield size={24} />,
      color: 'bg-orange-500',
    },
  ]
  const recommended = [
    {
      type: 'video' as const,
      title: 'Cómo funciona el interés compuesto',
      duration: '5 min',
      rating: 4.9,
      thumbnail:
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=400',
      isRecommended: true,
    },
    {
      type: 'article' as const,
      title: 'Guía para salir de deudas rápidamente',
      duration: '8 min',
      rating: 4.7,
      thumbnail:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
    {
      type: 'quiz' as const,
      title: 'Test de Salud Financiera',
      duration: '3 min',
      rating: 4.8,
      thumbnail:
        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=400',
    },
  ]
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Centro Educativo
          </h1>
          <p className="text-banorte-gray">
            Aprende a tomar mejores decisiones financieras
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar temas..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-banorte-red w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
      </div>

      <EducationHero />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Topics Grid */}
          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Temas Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics.map((topic, idx) => (
                <TopicCard key={idx} {...topic} />
              ))}
            </div>
          </div>

          {/* Recommended Content */}
          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Recomendado para ti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommended.map((content, idx) => (
                <ContentCard key={idx} {...content} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <LearningPath />
          <Quiz />
        </div>
      </div>
    </div>
  )
}

```