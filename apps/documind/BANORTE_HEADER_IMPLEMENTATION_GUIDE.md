# Banorte Header Component Implementation Guide

## 🎯 Complete Implementation Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] New or existing Next.js 14+ project with App Router
- [ ] Package manager (yarn/npm) available
- [ ] TypeScript configured (recommended)

### Phase 1: Dependencies & Setup
- [ ] Install all required dependencies
- [ ] Configure package.json scripts
- [ ] Set up PostCSS configuration

### Phase 2: Core Files
- [ ] Copy theme configuration
- [ ] Copy component files
- [ ] Set up ThemeProvider wrapper
- [ ] Configure Tailwind CSS

### Phase 3: Integration
- [ ] Update layout files
- [ ] Add global styles
- [ ] Configure font loading
- [ ] Test responsive behavior

### Phase 4: Verification
- [ ] Verify visual appearance
- [ ] Test accessibility features
- [ ] Validate responsive breakpoints
- [ ] Check browser compatibility

---

## 📦 Phase 1: Dependencies & Setup

### Step 1.1: Install Core Dependencies
```bash
# Core React/Next.js dependencies
yarn add next@^14.2.0 react@^18.3.0 react-dom@^18.3.0 typescript@^5.4.0

# Material-UI dependencies (EXACT versions for compatibility)
yarn add @mui/material@^7.3.1 @mui/icons-material@^7.3.1 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 @mui/material-nextjs@^7.3.0

# Tailwind CSS dependencies
yarn add tailwindcss@3.4.0 postcss@^8.4.31 autoprefixer@10.4.0 @tailwindcss/forms@0.5.7

# TypeScript type definitions
yarn add -D @types/react@^18.3.0 @types/react-dom@^18.3.0 @types/node@^20.12.0
```

### Step 1.2: Initialize Tailwind CSS
```bash
# Generate Tailwind configuration files
npx tailwindcss init -p
```

### Step 1.3: Verify package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 📁 Phase 2: Core Files Setup

### Step 2.1: Create Directory Structure
```bash
mkdir -p src/components
mkdir -p src/theme
mkdir -p src/app/components
mkdir -p public/images/logos
```

### Step 2.2: Copy Theme Configuration
**File: `src/theme/index.ts`**
```typescript
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#EB0029",
      dark: "#E30028",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#323E48",
    },
    background: {
      default: "#EBF0F2",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#323E48",
      secondary: "#5B6670",
      disabled: "#7B868C",
    },
    error: {
      main: "#FF671B",
    },
    warning: {
      main: "#FFA400",
    },
    success: {
      main: "#6CC04A",
    },
    divider: "#D1D5DB",
    action: {
      hover: "#E30028",
      selected: "rgba(235, 0, 41, 0.08)",
      disabled: "#7B868C",
      disabledBackground: "#F3F4F6",
    },
  },
  typography: {
    fontFamily: '"Gotham","Spline Sans","Noto Sans",sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          ...(ownerState.variant === 'contained' && ownerState.color === 'primary' && {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
        }),
      },
    },
  },
});

export default theme;
```

### Step 2.3: Create ThemeProvider Wrapper
**File: `src/app/components/ThemeProvider.tsx`**
```typescript
"use client";

import React from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
```

### Step 2.4: Configure Tailwind CSS
**File: `tailwind.config.ts`** (REPLACE existing content)
```typescript
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
        // Banorte Design System Colors
        primary: "#EBF0F2",
        surface1: "#FFFFFF",
        surface2: "#F8F9FA",

        // Text Colors (Banorte Official)
        textPrimary: "#323E48",
        textSecondary: "#5B6670",
        textDisabled: "#7B868C",

        // Interactive Elements
        banorteRed: "#EB0029",
        banorteRedHover: "#E30028",

        // Feedback Colors
        success: "#6CC04A",
        warning: "#FFA400",
        error: "#FF671B",

        // Borders and Dividers
        borderDashed: "#D1D5DB",
        borderLight: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Spline Sans", "Noto Sans", "sans-serif"],
      },
      borderRadius: {
        full: "9999px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};

export default config;
```

### Step 2.5: Add Logo Image to Public Folder
**IMPORTANT**: Place your Banorte logo image in the following location:
- **File path**: `public/images/logos/banorte-logo.png`
- **Recommended size**: 280x64px (or maintain 4.375:1 aspect ratio)
- **Format**: PNG with transparent background preferred
- **Variants**: You can add both `banorte-logo-white.png` and `banorte-logo-red.png` for different backgrounds

### Step 2.6: Create BanorteLogo Component with Image Support
**File: `src/components/BanorteLogo.tsx`**
```typescript
import Image from "next/image";

interface BanorteLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'red' | 'white';
  useImage?: boolean; // New prop to toggle between image and text
}

export default function BanorteLogo({
  className = "",
  width = 140,
  height = 32,
  variant = 'red',
  useImage = true // Default to using image
}: BanorteLogoProps) {
  const isWhite = variant === 'white';

  // If using image, render Next.js Image component
  if (useImage) {
    return (
      <div className={`flex items-center ${className}`} style={{ width, height }}>
        <Image
          src={isWhite ? "/images/logos/banorte-logo-white.png" : "/images/logos/banorte-logo.png"}
          alt="Banorte"
          width={width}
          height={height}
          priority={true} // Load logo immediately
          className="object-contain"
          style={{
            filter: isWhite ? 'brightness(0) invert(1)' : 'none', // Fallback if no white version
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>
    );
  }

  // Fallback to text-based logo (original implementation)
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ width, height }}>
      {/* Símbolo simple */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: height,
          height: height,
          backgroundColor: isWhite ? 'rgba(255, 255, 255, 0.2)' : '#EB0029',
          minWidth: height,
          border: isWhite ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: height * 0.4,
            height: height * 0.4,
            backgroundColor: isWhite ? '#FFFFFF' : '#FFFFFF'
          }}
        />
      </div>

      {/* Texto BANORTE */}
      <span
        className="font-bold tracking-wider"
        style={{
          color: isWhite ? '#FFFFFF' : '#EB0029',
          fontSize: height * 0.5,
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif',
          textShadow: isWhite ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        BANORTE
      </span>
    </div>
  );
}
```

### Step 2.7: Create Header Component with Image Logo
**File: `src/components/Header.tsx`**
```typescript
import Link from "next/link";
import BanorteLogo from "./BanorteLogo";

export default function Header() {
  return (
    <header
      className="flex items-center justify-between whitespace-nowrap px-10 py-3"
      style={{ backgroundColor: '#EB0029' }}
    >
      <div className="flex items-center gap-4 text-white">
        <BanorteLogo
          variant="white"
          height={32}
          width={140}
          useImage={true} // Enable image logo
        />
      </div>
      <div className="flex flex-1 justify-end gap-6">
        <nav className="flex items-center gap-8">
          {['Inicio','Documentos','Ayuda'].map((item) => (
            <Link key={item} href="#" className="text-sm font-medium leading-normal text-white hover:text-gray-200 transition-colors">
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {/* Ícono de búsqueda */}
          <button
            className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
            </svg>
          </button>

          {/* Ícono de notificaciones */}
          <button
            className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Notificaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>
            </svg>
          </button>

          {/* Ícono de menú */}
          <button
            className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## 🔧 Phase 3: Integration

### Step 3.1: Configure Global Styles
**File: `src/app/globals.css`** (CREATE or REPLACE)
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

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  font-family: "Gotham", "Spline Sans", "Noto Sans", system-ui, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}
```

### Step 3.2: Update Root Layout
**File: `src/app/layout.tsx`** (UPDATE existing file)
```typescript
import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your App - Banorte Design System",
  description: "Application using Banorte design system",
};

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

### Step 3.3: Create Example Page with Header
**File: `src/app/page.tsx`** (UPDATE existing file)
```typescript
import Header from "@/components/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="bg-surface1 rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-textPrimary mb-4">
            Banorte Design System
          </h1>
          <p className="text-textSecondary">
            Header component successfully integrated with Banorte branding.
          </p>
        </div>
      </main>
    </div>
  );
}
```

---

## ⚠️ Critical Setup Requirements

### 1. TypeScript Configuration
**File: `tsconfig.json`** (ENSURE these settings exist)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2. Next.js Configuration with Image Optimization
**File: `next.config.js`** (CREATE if doesn't exist)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    // Configure image optimization for logos
    formats: ['image/webp', 'image/png'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add domains if loading external images
    domains: [],
    // Optimize for logo images
    minimumCacheTTL: 31536000, // 1 year cache for logos
  },
}

module.exports = nextConfig
```

### 3. PostCSS Configuration
**File: `postcss.config.js`** (VERIFY content)
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 🖼️ Image Setup Instructions

### Required Logo Files
Place your Banorte logo images in the `public/images/logos/` directory:

```
public/
└── images/
    └── logos/
        ├── banorte-logo.png          # Main logo (red/dark backgrounds)
        ├── banorte-logo-white.png    # White version (for red header)
        └── banorte-logo-dark.png     # Optional: Dark version
```

### Image Specifications
- **Recommended size**: 280x64px (maintains 4.375:1 aspect ratio)
- **Format**: PNG with transparent background
- **File size**: Keep under 50KB for optimal loading
- **Quality**: High resolution for crisp display on retina screens

### Image Naming Convention
- `banorte-logo.png` - Default logo (red/colored)
- `banorte-logo-white.png` - White version for dark backgrounds
- `banorte-logo-dark.png` - Dark version for light backgrounds

### Logo Usage Examples
```typescript
// Use image logo (default)
<BanorteLogo variant="white" useImage={true} />

// Fallback to text logo if image not available
<BanorteLogo variant="white" useImage={false} />

// Custom sizing
<BanorteLogo variant="white" width={200} height={46} useImage={true} />
```

---

## 🚨 Common Integration Pitfalls & Solutions

### Pitfall 1: Font Loading Issues
**Problem**: Gotham font not displaying
**Solution**: 
```css
/* In globals.css - Add system font fallbacks */
body {
  font-family: "Gotham", "Spline Sans", "Noto Sans", system-ui, -apple-system, sans-serif;
}
```

### Pitfall 2: Tailwind Classes Not Working
**Problem**: Custom Tailwind classes not applying
**Solutions**:
1. Restart development server after changing `tailwind.config.ts`
2. Verify content paths include all component directories
3. Check for CSS import order in `globals.css`

### Pitfall 3: MUI Theme Not Applied
**Problem**: Material-UI components using default theme
**Solutions**:
1. Ensure ThemeProvider wraps entire app in `layout.tsx`
2. Verify `"use client"` directive in ThemeProvider component
3. Check for CSS specificity conflicts

### Pitfall 4: Import Path Errors
**Problem**: Cannot resolve `@/components/Header`
**Solutions**:
1. Verify `baseUrl` and `paths` in `tsconfig.json`
2. Ensure file structure matches import paths
3. Restart TypeScript server in IDE

### Pitfall 5: Logo Image Not Loading
**Problem**: Logo image doesn't display or shows broken image
**Solutions**:
1. Verify image file exists in `public/images/logos/` directory
2. Check image file names match exactly (case-sensitive)
3. Ensure image format is supported (PNG, JPG, WebP)
4. Verify Next.js image configuration in `next.config.js`
5. Use fallback to text logo: `<BanorteLogo useImage={false} />`

### Pitfall 6: Build Errors
**Problem**: Build fails with type errors
**Solutions**:
1. Install all `@types/*` packages
2. Verify TypeScript configuration
3. Check for missing dependencies

---

## ✅ Phase 4: Verification Steps

### Step 4.1: Start Development Server
```bash
yarn dev
# or
npm run dev
```

### Step 4.2: Visual Verification Checklist
- [ ] Header displays with Banorte red background (#EB0029)
- [ ] Logo image loads correctly (or text fallback displays)
- [ ] Logo appears with correct proportions and white variant
- [ ] Logo is crisp and clear on different screen densities
- [ ] Navigation items (Inicio, Documentos, Ayuda) are visible
- [ ] Action buttons (search, notifications, menu) display correctly
- [ ] Hover effects work on navigation and buttons
- [ ] Typography uses Gotham font (or fallbacks)
- [ ] No broken image icons or loading errors



