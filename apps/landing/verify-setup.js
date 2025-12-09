#!/usr/bin/env node

/**
 * Script de verificación para la landing principal
 * Verifica que todo esté configurado correctamente
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
};

console.log('\n🔍 Verificando configuración de Landing Principal...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar package.json
const checkFile = (filePath, description) => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log.success(`${description} existe`);
    return true;
  } else {
    log.error(`${description} NO encontrado: ${filePath}`);
    hasErrors = true;
    return false;
  }
};

// Archivos requeridos
console.log('📦 Verificando archivos principales:\n');
checkFile('package.json', 'package.json');
checkFile('next.config.js', 'next.config.js');
checkFile('tsconfig.json', 'tsconfig.json');
checkFile('tailwind.config.js', 'tailwind.config.js');
checkFile('postcss.config.js', 'postcss.config.js');

// Verificar estructura de directorios
console.log('\n📁 Verificando estructura de directorios:\n');
const checkDir = (dirPath, description) => {
  const fullPath = path.join(__dirname, dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    log.success(`Directorio ${description} existe`);
    return true;
  } else {
    log.error(`Directorio ${description} NO encontrado: ${dirPath}`);
    hasErrors = true;
    return false;
  }
};

checkDir('src', 'src');
checkDir('src/app', 'src/app');
checkDir('src/components', 'src/components');

// Verificar componentes principales
console.log('\n🎨 Verificando componentes:\n');
checkFile('src/components/Header.tsx', 'Header');
checkFile('src/components/AppGrid.tsx', 'AppGrid');
checkFile('src/components/AppCard.tsx', 'AppCard');
checkFile('src/components/AppCardHorizontal.tsx', 'AppCardHorizontal');
checkFile('src/components/AppCardMinimal.tsx', 'AppCardMinimal');
checkFile('src/components/AppCardBold.tsx', 'AppCardBold');

// Verificar páginas de Next.js
console.log('\n📄 Verificando páginas de Next.js:\n');
checkFile('src/app/layout.tsx', 'Layout principal');
checkFile('src/app/page.tsx', 'Página principal');
checkFile('src/app/globals.css', 'Estilos globales');

// Verificar variables de entorno
console.log('\n🔐 Verificando configuración de variables de entorno:\n');
const envExamplePath = path.join(__dirname, '.env.local.example');
if (fs.existsSync(envExamplePath)) {
  log.success('.env.local.example existe');

  const envLocalPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    log.success('.env.local configurado');

    // Leer y verificar variables
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    const requiredVars = [
      'NEXT_PUBLIC_DOCUMIND_URL',
      'NEXT_PUBLIC_SENTIMENT_URL',
    ];

    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        log.success(`Variable ${varName} definida`);
      } else {
        log.warning(`Variable ${varName} no encontrada (opcional)`);
        hasWarnings = true;
      }
    });
  } else {
    log.warning('.env.local no existe (opcional para desarrollo local)');
    log.info('Ejecuta: cp .env.local.example .env.local');
    hasWarnings = true;
  }
} else {
  log.error('.env.local.example no encontrado');
  hasErrors = true;
}

// Verificar node_modules
console.log('\n📚 Verificando dependencias:\n');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  log.success('node_modules existe');

  // Verificar algunas dependencias críticas
  const deps = ['next', 'react', 'react-dom', 'lucide-react'];
  deps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      log.success(`Dependencia ${dep} instalada`);
    } else {
      log.warning(`Dependencia ${dep} no encontrada`);
      hasWarnings = true;
    }
  });
} else {
  log.error('node_modules no encontrado');
  log.info('Ejecuta: pnpm install desde la raíz del monorepo');
  hasErrors = true;
}

// Verificar package.json del root
console.log('\n🔗 Verificando configuración del monorepo:\n');
const rootPackagePath = path.join(__dirname, '../../package.json');
if (fs.existsSync(rootPackagePath)) {
  const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));

  if (rootPackage.scripts && rootPackage.scripts['dev:landing']) {
    log.success('Script dev:landing configurado en root');
  } else {
    log.error('Script dev:landing NO encontrado en root package.json');
    hasErrors = true;
  }

  if (rootPackage.scripts && rootPackage.scripts['build:landing']) {
    log.success('Script build:landing configurado en root');
  } else {
    log.error('Script build:landing NO encontrado en root package.json');
    hasErrors = true;
  }
} else {
  log.warning('Root package.json no encontrado');
  hasWarnings = true;
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  log.error('Se encontraron errores críticos. Por favor corrígelos antes de continuar.');
  console.log('');
  process.exit(1);
} else if (hasWarnings) {
  log.warning('Verificación completada con advertencias.');
  log.info('Todo funcional, pero considera revisar las advertencias.');
  console.log('');
  process.exit(0);
} else {
  log.success('✓ Todo configurado correctamente!');
  console.log('');
  log.info('Siguiente paso:');
  console.log('  Desde la raíz del monorepo, ejecuta: pnpm dev:landing');
  console.log('  La landing estará disponible en: http://localhost:3002');
  console.log('');
  process.exit(0);
}
