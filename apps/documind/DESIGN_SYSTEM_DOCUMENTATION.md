# Banorte Design System Documentation

## 1. Design System Overview

The Banorte design system is a hybrid approach combining **Material-UI (MUI)** components with **Tailwind CSS** utilities, creating a cohesive and branded user interface for Banorte applications.

### Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Hybrid approach using Material-UI + Tailwind CSS
- **Typography**: Gotham (primary), Spline Sans, Noto Sans (fallbacks)
- **Language**: TypeScript for type safety
- **Package Manager**: Yarn

### Core Design Principles
- **Brand Consistency**: Banorte red (#EB0029) as primary color
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Reusability**: Modular components with clear interfaces
- **Performance**: Optimized with Next.js and efficient styling

### Color Palette

#### Primary Colors
```css
--banorte-red: #EB0029        /* Primary brand color */
--banorte-red-hover: #E30028  /* Hover state */
--primary-bg: #EBF0F2         /* Light background */
```

#### Surface Colors
```css
--surface1: #FFFFFF           /* Cards, modals */
--surface2: #F8F9FA          /* Secondary surfaces */
```

#### Text Colors
```css
--text-primary: #323E48       /* Main text */
--text-secondary: #5B6670     /* Secondary text */
--text-disabled: #7B868C      /* Disabled text */
```

#### Feedback Colors
```css
--success: #6CC04A           /* Success states */
--warning: #FFA400           /* Warning states */
--error: #FF671B             /* Error states */
```

#### Border Colors
```css
--border-dashed: #D1D5DB     /* Dashed borders */
--border-light: #E5E7EB      /* Light borders */
```

### Typography Scale
- **Font Family**: "Gotham", "Spline Sans", "Noto Sans", sans-serif
- **Headings**: Bold weights (600-700)
- **Body Text**: Regular weight (400)
- **Interactive Elements**: Medium weight (500-600)

### Component Categories

#### Layout Components
- **Header**: Main navigation header with logo and actions
- **ThemeProvider**: MUI theme wrapper for consistent styling

#### Interactive Components
- **UploadDropzone**: Drag-and-drop file upload with visual feedback
- **BanorteLogo**: Branded logo component with variants

#### Display Components
- **KeywordPanel**: Displays extracted keywords as chips
- **PDFViewer**: Document viewing components
- **LoadingStates**: Various loading and progress indicators

#### Utility Components
- **LoadingStates**: Comprehensive loading state management
- **EmptyState**: Placeholder content for empty states

## 2. Header Component Analysis

### Component Structure

<augment_code_snippet path="src/components/Header.tsx" mode="EXCERPT">
````typescript
export default function Header() {
  return (
    <header
      className="flex items-center justify-between whitespace-nowrap px-10 py-3"
      style={{ backgroundColor: '#EB0029' }}
    >
      <div className="flex items-center gap-4 text-white">
        <BanorteLogo variant="white" height={32} width={140} />
      </div>
      <div className="flex flex-1 justify-end gap-6">
        <nav className="flex items-center gap-8">
          {['Inicio','Documentos','Ayuda'].map((item) => (
            <Link key={item} href="#" className="text-sm font-medium leading-normal text-white hover:text-gray-200 transition-colors">
              {item}
            </Link>
          ))}
        </nav>
````
</augment_code_snippet>

### Props/Parameters
The Header component currently has **no props** - it's a static component with hardcoded navigation items.

**Potential Enhancement**: Could be made configurable with props like:
```typescript
interface HeaderProps {
  navigationItems?: Array<{label: string, href: string}>;
  showActions?: boolean;
  variant?: 'default' | 'minimal';
}
```

### Styling Approach
- **Primary Styling**: Tailwind CSS utility classes
- **Brand Color**: Inline style for Banorte red background
- **Layout**: Flexbox with space-between for logo and navigation
- **Responsive**: Uses responsive classes (gap-4, gap-6, gap-8)

### Dependencies and Imports
```typescript
import Link from "next/link";           // Next.js routing
import BanorteLogo from "./BanorteLogo"; // Custom logo component
```

**Required Dependencies**:
- `next` (for Link component)
- `react` (implicit)
- Custom `BanorteLogo` component

### State Management
- **No internal state** - purely presentational component
- **No context usage** - self-contained
- **Static navigation** - hardcoded menu items

### Responsive Behavior
- **Desktop**: Full horizontal layout with spaced navigation
- **Mobile**: Maintains layout but may need responsive adjustments
- **Breakpoints**: Uses Tailwind's responsive utilities

**Current Responsive Classes**:
- `px-10`: Horizontal padding
- `gap-4`, `gap-6`, `gap-8`: Responsive spacing
- `flex-1`: Flexible navigation area

### Accessibility Features
- **Semantic HTML**: Uses `<header>`, `<nav>` elements
- **ARIA Labels**: Action buttons have `aria-label` attributes
- **Keyboard Navigation**: Link elements are keyboard accessible
- **Color Contrast**: White text on red background meets WCAG standards

**Accessibility Implementations**:
```typescript
<button
  className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
  aria-label="Buscar"
>
```

### Icon Implementation
- **SVG Icons**: Inline SVG for search, notifications, menu
- **Consistent Sizing**: 20x20px icons
- **Hover States**: Semi-transparent white overlay
- **Accessibility**: Proper ARIA labels for screen readers

## 3. BanorteLogo Component Analysis

### Component Structure
<augment_code_snippet path="src/components/BanorteLogo.tsx" mode="EXCERPT">
````typescript
interface BanorteLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'red' | 'white';
}

export default function BanorteLogo({ className = "", width = 120, height = 32, variant = 'red' }: BanorteLogoProps) {
````
</augment_code_snippet>

### Props Interface
```typescript
interface BanorteLogoProps {
  className?: string;    // Additional CSS classes
  width?: number;        // Logo width in pixels (default: 120)
  height?: number;       // Logo height in pixels (default: 32)
  variant?: 'red' | 'white'; // Color variant (default: 'red')
}
```

### Styling Features
- **Dynamic Sizing**: Responsive to width/height props
- **Color Variants**: Red (default) and white versions
- **Proportional Scaling**: Text size scales with height
- **Brand Consistency**: Uses official Banorte colors

## 4. Reusability Guide

### Step 1: Install Required Dependencies

```bash
# Core dependencies
yarn add next react react-dom typescript
yarn add @mui/material @mui/icons-material @emotion/react @emotion/styled
yarn add @mui/material-nextjs

# Styling dependencies  
yarn add tailwindcss postcss autoprefixer
yarn add @tailwindcss/forms

# Development dependencies
yarn add -D @types/react @types/react-dom @types/node
```

### Step 2: Copy Required Files

**Essential Files to Copy**:
```
src/
├── components/
│   ├── Header.tsx              # Main header component
│   ├── BanorteLogo.tsx         # Logo component
│   └── LoadingStates.tsx       # (Optional) Loading components
├── theme/
│   └── index.ts                # MUI theme configuration
├── app/
│   ├── components/
│   │   └── ThemeProvider.tsx   # Theme wrapper
│   └── globals.css             # Global styles
├── tailwind.config.ts          # Tailwind configuration
└── postcss.config.js           # PostCSS configuration
```

### Step 3: Configuration Steps

#### 3.1 Tailwind Configuration
Copy the `tailwind.config.ts` with Banorte design tokens:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EBF0F2",
        surface1: "#FFFFFF", 
        surface2: "#F8F9FA",
        textPrimary: "#323E48",
        textSecondary: "#5B6670",
        textDisabled: "#7B868C",
        banorteRed: "#EB0029",
        banorteRedHover: "#E30028",
        success: "#6CC04A",
        warning: "#FFA400", 
        error: "#FF671B",
        borderDashed: "#D1D5DB",
        borderLight: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Spline Sans", "Noto Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
```

#### 3.2 Global Styles Setup
Add to your `globals.css`:

```css
@import url('https://fonts.cdnfonts.com/css/gotham');
@tailwind base;
@tailwind components; 
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  font-family: "Gotham", "Spline Sans", "Noto Sans", sans-serif;
}
```

#### 3.3 Theme Provider Setup
Wrap your app with the ThemeProvider:

```typescript
// app/layout.tsx
import ThemeProvider from "./components/ThemeProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-primary text-textPrimary font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 4: Integration Examples

#### 4.1 Basic Header Usage
```typescript
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

#### 4.2 Logo Usage Examples
```typescript
import BanorteLogo from "@/components/BanorteLogo";

// Default red logo
<BanorteLogo />

// White variant for dark backgrounds
<BanorteLogo variant="white" />

// Custom sizing
<BanorteLogo width={200} height={50} />

// With additional classes
<BanorteLogo className="mx-auto" variant="white" />
```

### Step 5: Customization Options

#### 5.1 Header Customization
To make the header configurable, modify the component:

```typescript
interface HeaderProps {
  navigationItems?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
}

export default function Header({
  navigationItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Documentos', href: '/documents' },
    { label: 'Ayuda', href: '/help' }
  ],
  showSearch = true,
  showNotifications = true,
  showMenu = true,
  onSearchClick,
  onNotificationClick,
  onMenuClick
}: HeaderProps) {
  // Implementation with conditional rendering
}
```

#### 5.2 Theme Customization
Modify colors in both Tailwind and MUI configurations:

```typescript
// In tailwind.config.ts - change brand colors
colors: {
  banorteRed: "#YOUR_BRAND_COLOR",
  banorteRedHover: "#YOUR_BRAND_HOVER_COLOR",
}

// In theme/index.ts - update MUI theme
primary: {
  main: "#YOUR_BRAND_COLOR",
  dark: "#YOUR_BRAND_HOVER_COLOR",
}
```

### Step 6: Common Pitfalls and Troubleshooting

#### 6.1 Font Loading Issues
**Problem**: Gotham font not loading
**Solution**: 
```css
/* Add fallback fonts and ensure CDN is accessible */
font-family: "Gotham", "Spline Sans", "Noto Sans", system-ui, sans-serif;
```

#### 6.2 Tailwind Classes Not Working
**Problem**: Custom Tailwind classes not applying
**Solution**: 
- Ensure content paths in `tailwind.config.ts` include your files
- Restart development server after config changes
- Check for CSS purging issues

#### 6.3 MUI Theme Conflicts
**Problem**: MUI components not using custom theme
**Solution**:
- Ensure ThemeProvider wraps your entire app
- Check for CSS specificity conflicts
- Use MUI's `sx` prop for component-specific overrides

#### 6.4 Next.js Link Issues
**Problem**: Navigation links not working
**Solution**:
```typescript
// Ensure proper Next.js Link usage
import Link from "next/link";

<Link href="/path" className="...">
  Navigation Item
</Link>
```

#### 6.5 TypeScript Errors
**Problem**: Type errors with component props
**Solution**:
- Install all required `@types/*` packages
- Ensure proper interface definitions
- Use proper TypeScript configuration

### Step 7: Performance Optimization

#### 7.1 Bundle Size Optimization
```typescript
// Use tree-shaking for MUI icons
import SearchIcon from '@mui/icons-material/Search';
// Instead of: import { Search } from '@mui/icons-material';
```

#### 7.2 CSS Optimization
```css
/* Use Tailwind's purge feature */
/* Minimize custom CSS in favor of utility classes */
```

#### 7.3 Font Optimization
```typescript
// Consider using next/font for better font loading
import { Inter } from 'next/font/google';
```

## 5. Advanced Integration Patterns

### 5.1 Routing Integration

#### Next.js App Router Integration
```typescript
// app/layout.tsx - Full layout with header
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-primary text-textPrimary font-sans">
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Dynamic Navigation with Active States
```typescript
// Enhanced Header with active navigation
"use client";
import { usePathname } from 'next/navigation';
import Link from "next/link";
import BanorteLogo from "./BanorteLogo";

interface NavigationItem {
  label: string;
  href: string;
}

interface HeaderProps {
  navigationItems?: NavigationItem[];
}

export default function Header({
  navigationItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Documentos', href: '/documents' },
    { label: 'Ayuda', href: '/help' }
  ]
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between whitespace-nowrap px-10 py-3"
            style={{ backgroundColor: '#EB0029' }}>
      <div className="flex items-center gap-4 text-white">
        <BanorteLogo variant="white" height={32} width={140} />
      </div>
      <div className="flex flex-1 justify-end gap-6">
        <nav className="flex items-center gap-8">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium leading-normal transition-colors ${
                  isActive
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Action buttons remain the same */}
      </div>
    </header>
  );
}
```

### 5.2 State Management Integration

#### With React Context
```typescript
// contexts/NavigationContext.tsx
"use client";
import { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  notifications: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('');
  const [notifications, setNotifications] = useState(0);

  return (
    <NavigationContext.Provider value={{ currentPage, setCurrentPage, notifications }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
```

#### Header with Context Integration
```typescript
// Enhanced Header with context
import { useNavigation } from '@/contexts/NavigationContext';

export default function Header() {
  const { notifications } = useNavigation();

  return (
    <header className="flex items-center justify-between whitespace-nowrap px-10 py-3"
            style={{ backgroundColor: '#EB0029' }}>
      {/* Logo section */}
      <div className="flex items-center gap-4 text-white">
        <BanorteLogo variant="white" height={32} width={140} />
      </div>

      {/* Navigation and actions */}
      <div className="flex flex-1 justify-end gap-6">
        <nav className="flex items-center gap-8">
          {/* Navigation items */}
        </nav>

        <div className="flex items-center gap-4">
          {/* Notification button with badge */}
          <button
            className="relative flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label={`Notificaciones${notifications > 0 ? ` (${notifications})` : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>
            </svg>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
```

### 5.3 Responsive Design Patterns

#### Mobile-First Header
```typescript
// Responsive Header with mobile menu
"use client";
import { useState } from 'react';
import Link from "next/link";
import BanorteLogo from "./BanorteLogo";

export default function ResponsiveHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap px-4 lg:px-10 py-3"
              style={{ backgroundColor: '#EB0029' }}>
        {/* Logo */}
        <div className="flex items-center gap-4 text-white">
          <BanorteLogo variant="white" height={28} width={120} className="lg:h-8 lg:w-36" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-end gap-6">
          <nav className="flex items-center gap-8">
            {['Inicio','Documentos','Ayuda'].map((item) => (
              <Link key={item} href="#"
                    className="text-sm font-medium leading-normal text-white hover:text-gray-200 transition-colors">
                {item}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-4">
            {/* Action buttons */}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <BanorteLogo variant="red" height={24} width={100} />
            </div>
            <nav className="p-4">
              {['Inicio','Documentos','Ayuda'].map((item) => (
                <Link key={item} href="#"
                      className="block py-3 text-textPrimary hover:text-banorteRed transition-colors border-b border-borderLight last:border-b-0">
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
```

## 6. Testing and Quality Assurance

### 6.1 Component Testing
```typescript
// __tests__/Header.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import Header from '@/components/Header';
import theme from '@/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Header Component', () => {
  it('renders logo and navigation', () => {
    renderWithTheme(<Header />);

    expect(screen.getByText('BANORTE')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(<Header />);

    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    expect(screen.getByLabelText('Menú')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    renderWithTheme(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({ backgroundColor: '#EB0029' });
  });
});
```

### 6.2 Visual Regression Testing
```typescript
// __tests__/Header.visual.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Header from '@/components/Header';

expect.extend(toHaveNoViolations);

describe('Header Visual Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 7. Migration Guide

### 7.1 From Legacy Systems
```typescript
// Legacy header migration example
// Before: Class-based component
class LegacyHeader extends Component {
  render() {
    return (
      <div className="header">
        <img src="/logo.png" alt="Logo" />
        <nav>...</nav>
      </div>
    );
  }
}

// After: Modern functional component
export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap px-10 py-3"
            style={{ backgroundColor: '#EB0029' }}>
      <BanorteLogo variant="white" height={32} width={140} />
      {/* Modern navigation */}
    </header>
  );
}
```

### 7.2 CSS-in-JS Migration
```typescript
// From styled-components to Tailwind + MUI
// Before:
const StyledHeader = styled.header`
  background-color: #EB0029;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 40px;
`;

// After:
<header
  className="flex items-center justify-between whitespace-nowrap px-10 py-3"
  style={{ backgroundColor: '#EB0029' }}
>
```

This comprehensive documentation provides everything needed to understand, implement, and maintain the Banorte design system and header component across different projects and environments.
