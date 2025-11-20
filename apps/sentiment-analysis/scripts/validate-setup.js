#!/usr/bin/env node

/**
 * Setup validation script for Banorte Sentiment Analysis POC
 * This script validates the environment configuration and dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Banorte Sentiment Analysis POC Setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  '.env.example',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/core/domain/entities/SentimentAnalysis.ts',
  'src/infrastructure/di/DIContainer.ts',
];

console.log('📁 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ Missing ${missingFiles.length} required files. Please ensure all files are created.`);
  process.exit(1);
}

// Check package.json dependencies
console.log('\n📦 Checking package.json dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredDependencies = [
  'next',
  'react',
  'react-dom',
  '@mui/material',
  '@mui/icons-material',
  'openai',
  'pdf-parse',
  'recharts',
  'react-dropzone',
  'uuid',
];

const requiredDevDependencies = [
  'typescript',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'eslint',
  'eslint-config-next',
];

let missingDeps = [];

requiredDependencies.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    missingDeps.push(dep);
  }
});

requiredDevDependencies.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} (dev)`);
  } else {
    console.log(`❌ ${dep} (dev) - MISSING`);
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.log(`\n❌ Missing ${missingDeps.length} required dependencies. Run 'yarn install' to install them.`);
}

// Check environment configuration
console.log('\n🔧 Checking environment configuration...');

if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local exists');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=') && !envContent.includes('OPENAI_API_KEY=your_openai_api_key_here');
  
  if (hasOpenAIKey) {
    console.log('✅ OPENAI_API_KEY is configured');
  } else {
    console.log('⚠️  OPENAI_API_KEY needs to be configured in .env.local');
  }
} else {
  console.log('⚠️  .env.local not found. Copy .env.example to .env.local and configure your API keys.');
}

// Check TypeScript configuration
console.log('\n🔷 Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.strict) {
    console.log('✅ TypeScript strict mode enabled');
  }
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.paths) {
    console.log('✅ Path aliases configured');
  }
} catch (error) {
  console.log('❌ Error reading tsconfig.json:', error.message);
}

// Architecture validation
console.log('\n🏗️  Validating Clean Architecture structure...');

const architecturePaths = [
  'src/core/domain/entities',
  'src/core/domain/value-objects',
  'src/core/domain/ports',
  'src/core/application/use-cases',
  'src/infrastructure/sentiment',
  'src/infrastructure/text-extraction',
  'src/infrastructure/repositories',
  'src/infrastructure/export',
  'src/infrastructure/di',
  'src/app/api',
  'src/app/components',
  'src/shared/types',
  'src/shared/utils',
];

architecturePaths.forEach(dirPath => {
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dirPath}`);
  } else {
    console.log(`❌ ${dirPath} - MISSING`);
  }
});

console.log('\n🎉 Setup validation complete!');
console.log('\n📋 Next steps:');
console.log('1. Ensure all dependencies are installed: yarn install');
console.log('2. Configure your OpenAI API key in .env.local');
console.log('3. Run the development server: yarn dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📖 For detailed instructions, see INSTALLATION.md');
