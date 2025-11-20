# Header Component Quick Reference Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
yarn add next react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled tailwindcss
```

### 2. Copy Files
```
src/
├── components/
│   ├── Header.tsx
│   └── BanorteLogo.tsx
├── theme/index.ts
└── app/components/ThemeProvider.tsx
```

### 3. Basic Usage
```typescript
import Header from "@/components/Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## 🎨 Design Tokens

### Colors
```css
/* Primary Brand */
--banorte-red: #EB0029
--banorte-red-hover: #E30028

/* Backgrounds */
--primary-bg: #EBF0F2
--surface1: #FFFFFF
--surface2: #F8F9FA

/* Text */
--text-primary: #323E48
--text-secondary: #5B6670
--text-disabled: #7B868C
```

### Typography
```css
font-family: "Gotham", "Spline Sans", "Noto Sans", sans-serif
```

## 🧩 Component API

### Header Component
```typescript
// Current: No props (static)
<Header />

// Enhanced version with props:
interface HeaderProps {
  navigationItems?: Array<{label: string, href: string}>;
  showActions?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
}
```

### BanorteLogo Component
```typescript
interface BanorteLogoProps {
  className?: string;
  width?: number;        // Default: 120
  height?: number;       // Default: 32
  variant?: 'red' | 'white'; // Default: 'red'
}

// Examples:
<BanorteLogo />                           // Default red logo
<BanorteLogo variant="white" />           // White variant
<BanorteLogo width={200} height={50} />   // Custom size
```

## 📱 Responsive Breakpoints

```css
/* Tailwind breakpoints used */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🎯 Common Use Cases

### 1. Basic Layout
```typescript
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-primary">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
```

### 2. With Active Navigation
```typescript
"use client";
import { usePathname } from 'next/navigation';

export default function HeaderWithActiveNav() {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Documentos', href: '/documents' },
    { label: 'Ayuda', href: '/help' }
  ];

  return (
    <header className="flex items-center justify-between px-10 py-3" 
            style={{ backgroundColor: '#EB0029' }}>
      <BanorteLogo variant="white" height={32} width={140} />
      <nav className="flex items-center gap-8">
        {navItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href}
            className={`text-sm font-medium transition-colors ${
              pathname === item.href 
                ? 'text-white border-b-2 border-white' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

### 3. Mobile Responsive
```typescript
"use client";
import { useState } from 'react';

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 lg:px-10 py-3" 
              style={{ backgroundColor: '#EB0029' }}>
        <BanorteLogo variant="white" height={28} width={120} />
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Navigation items */}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </header>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg">
          {/* Mobile navigation */}
        </div>
      )}
    </>
  );
}
```

## 🔧 Customization

### Change Brand Colors
```typescript
// tailwind.config.ts
colors: {
  banorteRed: "#YOUR_COLOR",
  banorteRedHover: "#YOUR_HOVER_COLOR",
}

// theme/index.ts
primary: {
  main: "#YOUR_COLOR",
  dark: "#YOUR_HOVER_COLOR",
}
```

### Custom Navigation Items
```typescript
const customNavItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' }
];

// Pass to enhanced Header component
<Header navigationItems={customNavItems} />
```

### Logo Customization
```typescript
// Different sizes for different contexts
<BanorteLogo height={24} width={100} />  // Compact
<BanorteLogo height={40} width={160} />  // Large
<BanorteLogo height={32} width={140} />  // Default

// Different variants
<BanorteLogo variant="white" />  // For dark backgrounds
<BanorteLogo variant="red" />    // For light backgrounds
```

## ⚠️ Common Issues & Solutions

### 1. Fonts Not Loading
```css
/* Add fallbacks in globals.css */
body {
  font-family: "Gotham", "Spline Sans", "Noto Sans", system-ui, sans-serif;
}
```

### 2. Tailwind Classes Not Working
```javascript
// Ensure content paths in tailwind.config.ts
content: [
  "./src/app/**/*.{ts,tsx}",
  "./src/components/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}"
]
```

### 3. MUI Theme Not Applied
```typescript
// Wrap app with ThemeProvider
import ThemeProvider from "./components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Next.js Link Issues
```typescript
// Correct Link usage
import Link from "next/link";

<Link href="/path" className="...">
  Link Text
</Link>
```

## 📋 Checklist for Implementation

- [ ] Install all required dependencies
- [ ] Copy component files (Header.tsx, BanorteLogo.tsx)
- [ ] Copy theme configuration (theme/index.ts)
- [ ] Set up ThemeProvider wrapper
- [ ] Configure Tailwind with design tokens
- [ ] Add global styles and fonts
- [ ] Test responsive behavior
- [ ] Verify accessibility features
- [ ] Test navigation functionality
- [ ] Validate brand colors and typography

## 🔗 Related Files

- `src/components/Header.tsx` - Main header component
- `src/components/BanorteLogo.tsx` - Logo component
- `src/theme/index.ts` - MUI theme configuration
- `tailwind.config.ts` - Tailwind design tokens
- `src/app/globals.css` - Global styles
- `src/app/components/ThemeProvider.tsx` - Theme wrapper

## 📚 Additional Resources

- [Material-UI Documentation](https://mui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Accessibility Guidelines](https://reactjs.org/docs/accessibility.html)

---

**Need help?** Check the full `DESIGN_SYSTEM_DOCUMENTATION.md` for comprehensive details and advanced patterns.
