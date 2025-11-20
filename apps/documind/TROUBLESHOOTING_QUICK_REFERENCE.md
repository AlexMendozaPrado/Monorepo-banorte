# Banorte Header - Troubleshooting Quick Reference

## 🚨 Emergency Fixes

### Issue: "Cannot resolve '@/components/Header'"
```bash
# Fix 1: Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Fix 2: Restart TypeScript server
# In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Tailwind classes not working
```bash
# Fix 1: Restart dev server
yarn dev

# Fix 2: Check tailwind.config.ts content paths
content: [
  "./src/app/**/*.{ts,tsx}",
  "./src/components/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}"
]

# Fix 3: Verify CSS import order in globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Issue: MUI theme not applied
```typescript
// Fix: Ensure ThemeProvider wraps app in layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Issue: Fonts not loading
```css
/* Fix: Add fallbacks in globals.css */
body {
  font-family: "Gotham", "Spline Sans", "Noto Sans", system-ui, sans-serif;
}
```

### Issue: Build errors
```bash
# Fix 1: Clear cache and reinstall
rm -rf .next node_modules yarn.lock
yarn install

# Fix 2: Check for missing dependencies
yarn add @types/react @types/react-dom @types/node

# Fix 3: Verify all imports are correct
# Check for typos in component imports
```

## 🔍 Diagnostic Commands

```bash
# Check TypeScript errors
npx tsc --noEmit

# Verify Tailwind compilation
npx tailwindcss -i ./src/app/globals.css -o ./test-output.css

# Test production build
yarn build

# Check dependency versions
yarn list --pattern "@mui|tailwind|next|react"
```

## ✅ Quick Verification Checklist

### Visual Check (30 seconds)
- [ ] Red header background (#EB0029)
- [ ] White Banorte logo visible
- [ ] Three navigation items showing
- [ ] Three action buttons (search, bell, menu)

### Functional Check (1 minute)
- [ ] Hover effects on navigation links
- [ ] Hover effects on action buttons
- [ ] No console errors in browser
- [ ] Responsive layout on mobile

### Code Check (2 minutes)
- [ ] All files in correct directories
- [ ] No TypeScript errors
- [ ] Imports resolve correctly
- [ ] Build completes successfully

## 📞 Support Resources

- **Full Guide**: `BANORTE_HEADER_IMPLEMENTATION_GUIDE.md`
- **Design System**: `DESIGN_SYSTEM_DOCUMENTATION.md`
- **Quick Reference**: `HEADER_COMPONENT_QUICK_REFERENCE.md`

## 🎯 Success Indicators

✅ **Working correctly when:**
- Header appears with Banorte branding
- No console errors
- Responsive behavior works
- All interactive elements functional
- Build process completes without errors
