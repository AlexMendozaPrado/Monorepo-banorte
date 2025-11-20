  # DocuMind - Comprehensive Architecture Documentation

  ## 📋 Project Overview

  **DocuMind** is a proof-of-concept (POC) web application built for Banorte that enables PDF document analysis and automatic keyword extraction using AI. The application demonstrates a modern, scalable architecture implementing Clean Architecture principles with Next.js 14+ and TypeScript.

  ### Key Features
  - **PDF Upload & Visualization**: Drag & drop interface with integrated PDF viewer
  - **AI-Powered Analysis**: Automatic keyword extraction using OpenAI GPT models
  - **Real-time Processing**: Progressive loading states with user feedback
  - **Clean Architecture**: Hexagonal architecture with clear separation of concerns
  - **Modern UI**: Material UI components with Banorte design system
  - **TypeScript**: Full type safety throughout the application

  ---

  ## 🏗️ Architecture Overview

  ### High-Level System Design

  The application follows **Clean Architecture (Hexagonal Architecture)** principles with clear separation between layers:

  ```
  ┌─────────────────────────────────────────────────────────────┐
  │                    PRESENTATION LAYER                       │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
  │  │   React UI      │  │   API Routes    │  │   Layouts   │ │
  │  │   Components    │  │   (Next.js)     │  │   & Pages   │ │
  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │
  └─────────────────────────────────────────────────────────────┘
                                │
  ┌─────────────────────────────────────────────────────────────┐
  │                   APPLICATION LAYER                         │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
  │  │   Use Cases     │  │   Services      │  │ Composition │ │
  │  │ (Business Logic)│  │ (App Services)  │  │   (DI)      │ │
  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │
  └─────────────────────────────────────────────────────────────┘
                                │
  ┌─────────────────────────────────────────────────────────────┐
  │                     DOMAIN LAYER                            │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
  │  │   Entities      │  │     Ports       │  │   Value     │ │
  │  │  (Models)       │  │ (Interfaces)    │  │   Objects   │ │
  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │
  └─────────────────────────────────────────────────────────────┘
                                │
  ┌─────────────────────────────────────────────────────────────┐
  │                 INFRASTRUCTURE LAYER                        │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
  │  │  PDF Extractor  │  │  OpenAI Client  │  │   Config    │ │
  │  │   (pdf-parse)   │  │   (OpenAI SDK)  │  │   (env)     │ │
  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │
  └─────────────────────────────────────────────────────────────┘
  ```

  ### Component Relationships

  ```mermaid
  graph TB
      UI[React Components] --> API[API Routes]
      API --> UC[Use Cases]
      UC --> TE[Text Extractor Port]
      UC --> KE[Keyword Extractor Port]
      TE --> PDF[PDF Parser Adapter]
      KE --> AI[OpenAI Adapter]
      
      subgraph "Domain Layer"
          TE
          KE
          K[Keyword Entity]
      end
      
      subgraph "Infrastructure Layer"
          PDF
          AI
          ENV[Environment Config]
      end
      
      subgraph "Application Layer"
          UC
          PS[Prompt Service]
      end
      
      subgraph "Presentation Layer"
          UI
          API
      end
  ```

  ---

  ## 📁 Project Structure

  ### Complete Directory Structure

  ```
  PocBanorte/
  ├── src/
  │   ├── app/                          # Next.js App Router
  │   │   ├── analyze/                  # Main analysis page
  │   │   │   ├── page.tsx             # Main page component
  │   │   │   ├── page-simple.tsx     # Simplified version
  │   │   │   └── components/          # Page-specific components
  │   │   │       ├── UploadBar.tsx    # File upload component
  │   │   │       ├── PdfPane.tsx      # PDF viewer pane
  │   │   │       ├── KeywordsPane.tsx # Keywords display pane
  │   │   │       ├── EmptyState.tsx   # Empty state component
  │   │   │       └── LoadingState.tsx # Loading states
  │   │   ├── api/                     # API routes
  │   │   │   └── analyze/
  │   │   │       └── route.ts         # PDF analysis endpoint
  │   │   ├── components/              # Global components
  │   │   │   └── ThemeProvider.tsx    # MUI theme provider
  │   │   ├── layout.tsx               # Root layout
  │   │   ├── page.tsx                 # Home page
  │   │   └── globals.css              # Global styles
  │   ├── components/                  # Shared UI components
  │   │   ├── BanorteLogo.tsx         # Banorte logo component
  │   │   ├── Header.tsx              # Application header
  │   │   ├── KeywordPanel.tsx        # Keyword display panel
  │   │   ├── LoadingStates.tsx       # Loading state components
  │   │   ├── PDFViewer.tsx           # Advanced PDF viewer
  │   │   ├── SimplePDFViewer.tsx     # Simple PDF viewer
  │   │   └── UploadDropzone.tsx      # File upload dropzone
  │   ├── core/                       # Domain & Application layers
  │   │   ├── domain/                 # Domain layer
  │   │   │   └── documents/
  │   │   │       ├── Keyword.ts      # Keyword entity
  │   │   │       └── ports/          # Domain interfaces
  │   │   │           ├── DocumentTextExtractorPort.ts
  │   │   │           ├── KeywordExtractorPort.ts
  │   │   │           └── index.ts
  │   │   └── application/            # Application layer
  │   │       └── documents/
  │   │           ├── use-cases/
  │   │           │   └── AnalyzePdfUseCase.ts  # Main use case
  │   │           └── services/
  │   │               └── PromptBuilder.ts     # AI prompt builder
  │   ├── infrastructure/             # Infrastructure layer
  │   │   ├── pdf/
  │   │   │   └── PdfParseTextExtractor.ts    # PDF text extraction
  │   │   └── llm/
  │   │       └── OpenAIKeywordExtractor.ts   # OpenAI integration
  │   ├── composition/                # Dependency injection
  │   │   └── container.ts            # DI container
  │   ├── lib/                        # Utilities
  │   │   └── env.ts                  # Environment configuration
  │   └── theme/                      # UI theme
  │       └── index.ts                # MUI theme configuration
  ├── public/                         # Static assets
  ├── .env.local.example             # Environment variables template
  ├── .eslintrc.json                 # ESLint configuration
  ├── .gitignore                     # Git ignore rules
  ├── DEMO.md                        # Demo instructions
  ├── next.config.js                 # Next.js configuration
  ├── package.json                   # Dependencies and scripts
  ├── postcss.config.js              # PostCSS configuration
  ├── PROJECT_SUMMARY.md             # Project summary
  ├── README.md                      # Project documentation
  ├── tailwind.config.ts             # Tailwind CSS configuration
  ├── TROUBLESHOOTING.md             # Troubleshooting guide
  ├── tsconfig.json                  # TypeScript configuration
  └── yarn.lock                      # Dependency lock file
  ```

  ---

  ## 🛠️ Technology Stack

  ### Frontend Technologies
  - **Next.js 14+**: React framework with App Router
  - **React 18**: UI library with modern features
  - **TypeScript 5.4+**: Static typing and enhanced developer experience
  - **Material UI (MUI) 7.3+**: Component library with theming
  - **Tailwind CSS 3.4**: Utility-first CSS framework
  - **react-pdf 7.7+**: PDF rendering and visualization

  ### Backend Technologies
  - **Next.js API Routes**: Server-side API endpoints
  - **pdf-parse 1.1+**: PDF text extraction library
  - **OpenAI Node SDK 4.52+**: AI integration for keyword extraction

  ### Development Tools
  - **ESLint**: Code linting and quality
  - **PostCSS**: CSS processing
  - **Autoprefixer**: CSS vendor prefixing
  - **Yarn**: Package management (preferred)

  ### External Services
  - **OpenAI GPT-4o-mini**: AI model for keyword extraction
  - **PDF.js**: PDF rendering engine (via react-pdf)

  ---

  ## ⚙️ Configuration Details

  ### Environment Variables

  ```env
  # OpenAI Configuration
  OPENAI_API_KEY=sk-your-openai-api-key-here
  OPENAI_MODEL=gpt-4o-mini

  # Application Configuration
  MAX_UPLOAD_MB=20
  ```

  ### Next.js Configuration (`next.config.js`)

  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    experimental: {
      // External packages for server components
      serverComponentsExternalPackages: ['pdf-parse']
    },
    webpack: (config) => {
      // Disable canvas for react-pdf compatibility
      config.resolve.alias.canvas = false;
      return config;
    }
  };

  module.exports = nextConfig;
  ```

  ### TypeScript Configuration (`tsconfig.json`)

  ```json
  {
    "compilerOptions": {
      "lib": ["dom", "dom.iterable", "es6"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "forceConsistentCasingInFileNames": true,
      "plugins": [{ "name": "next" }],
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  ```

  ### Tailwind CSS Configuration (`tailwind.config.ts`)

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

  ---

  ## 🔧 Key Components

  ### Domain Layer

  #### Keyword Entity (`src/core/domain/documents/Keyword.ts`)
  ```typescript
  export type Keyword = {
    phrase: string;
    kind?: string;
  };
  ```

  #### Ports/Interfaces
  - **DocumentTextExtractorPort**: Interface for PDF text extraction
  - **KeywordExtractorPort**: Interface for AI keyword extraction

  ### Application Layer

  #### AnalyzePdfUseCase (`src/core/application/documents/use-cases/AnalyzePdfUseCase.ts`)
  Main business logic orchestrating PDF analysis:
  - Validates input parameters
  - Extracts text from PDF using text extractor port
  - Generates keywords using keyword extractor port
  - Returns structured results

  #### PromptBuilder Service (`src/core/application/documents/services/PromptBuilder.ts`)
  Constructs AI prompts with:
  - Multiple analysis modes (generic, legal, academic, finance)
  - Localization support (Spanish/English)
  - Configurable keyword categories
  - Structured JSON output formatting

  ### Infrastructure Layer

  #### PdfParseTextExtractor (`src/infrastructure/pdf/PdfParseTextExtractor.ts`)
  PDF text extraction implementation:
  - Uses pdf-parse library
  - Validates file types
  - Error handling and logging
  - Returns extracted text

  #### OpenAIKeywordExtractor (`src/infrastructure/llm/OpenAIKeywordExtractor.ts`)
  OpenAI integration for keyword extraction:
  - Uses OpenAI Node SDK
  - Configurable models and parameters
  - JSON response parsing
  - Robust error handling

  ### Presentation Layer

  #### API Route (`src/app/api/analyze/route.ts`)
  RESTful endpoint handling:
  - File upload validation
  - Size and type restrictions
  - Use case execution
  - Error response formatting

  #### React Components
  - **AnalyzePage**: Main page component with state management
  - **PDFViewer**: Advanced PDF rendering with navigation
  - **KeywordsPane**: Keyword display with editing capabilities
  - **UploadDropzone**: Drag & drop file upload interface

  ---

  ## 📊 Data Flow

  ### Request Flow Diagram

  ```mermaid
  sequenceDiagram
      participant User
      participant UI as React UI
      participant API as API Route
      participant UC as Use Case
      participant PDF as PDF Extractor
      participant AI as OpenAI Extractor
      
      User->>UI: Upload PDF file
      UI->>API: POST /api/analyze
      API->>UC: execute(pdfData)
      UC->>PDF: extractText(bytes)
      PDF-->>UC: { fullText }
      UC->>AI: extract(text, options)
      AI-->>UC: keywords[]
      UC-->>API: { keywords }
      API-->>UI: JSON response
      UI-->>User: Display keywords
  ```

  ### Data Processing Pipeline

  1. **File Upload**: User uploads PDF via drag & drop or file picker
  2. **Validation**: File type, size, and format validation
  3. **Text Extraction**: PDF content extracted using pdf-parse
  4. **AI Processing**: Text sent to OpenAI for keyword extraction
  5. **Response Processing**: JSON parsing and keyword structuring
  6. **UI Update**: Keywords displayed as interactive chips

  ---

  ## 🔗 Dependencies

  ### Production Dependencies

  ```json
  {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^7.3.1",
    "@mui/material": "^7.3.1",
    "@mui/material-nextjs": "^7.3.0",
    "next": "^14.2.0",
    "openai": "^4.52.0",
    "pdf-parse": "^1.1.1",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-pdf": "^7.7.0",
    "typescript": "^5.4.0"
  }
  ```

  ### Development Dependencies

  ```json
  {
    "@tailwindcss/forms": "0.5.7",
    "autoprefixer": "10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.31",
    "tailwindcss": "3.4.0"
  }
  ```

  ### External Services
  - **OpenAI API**: GPT-4o-mini model for keyword extraction
  - **PDF.js**: Client-side PDF rendering (via CDN)

  ---

  ## 🚀 Setup Instructions

  ### Prerequisites
  - Node.js 18+ 
  - Yarn 1.22+ (recommended) or npm
  - OpenAI API key

  ### Installation Steps

  1. **Clone and Install**
  ```bash
  git clone <repository-url>
  cd PocBanorte
  yarn install
  ```

  2. **Environment Configuration**
  ```bash
  cp .env.local.example .env.local
  # Edit .env.local with your OpenAI API key
  ```

  3. **Development Server**
  ```bash
  yarn dev
  # Application available at http://localhost:3000
  ```

  4. **Production Build**
  ```bash
  yarn build
  yarn start
  ```

  ### Available Scripts

  ```bash
  yarn dev         # Development server
  yarn build       # Production build
  yarn start       # Production server
  yarn lint        # ESLint checking
  yarn clean       # Clean build artifacts
  yarn fresh       # Clean install and dev
  ```

  ---

  ## 🎨 Design Patterns

  ### Clean Architecture (Hexagonal)
  - **Separation of Concerns**: Clear boundaries between layers
  - **Dependency Inversion**: Dependencies point inward toward domain
  - **Port & Adapter Pattern**: Interfaces for external integrations
  - **Use Case Pattern**: Business logic encapsulation

  ### Dependency Injection
  - **Container Pattern**: Centralized dependency composition
  - **Factory Pattern**: Use case instantiation
  - **Configuration Pattern**: Environment-based setup

  ### Frontend Patterns
  - **Component Composition**: Reusable UI components
  - **State Management**: React hooks for local state
  - **Error Boundaries**: Graceful error handling
  - **Progressive Enhancement**: Loading states and fallbacks

  ### API Design
  - **RESTful Endpoints**: Standard HTTP methods and status codes
  - **Request/Response DTOs**: Structured data transfer
  - **Validation Middleware**: Input sanitization and validation
  - **Error Handling**: Consistent error response format

  ---

  ## 🔒 Security Considerations

  ### API Security
  - **Environment Variables**: Sensitive keys stored server-side only
  - **Input Validation**: File type, size, and content validation
  - **Error Handling**: No sensitive information in error responses
  - **Rate Limiting**: Configurable upload size limits

  ### Data Privacy
  - **No Persistence**: Files processed in memory only
  - **Temporary URLs**: Automatic cleanup of blob URLs
  - **Server-side Processing**: AI processing on secure server environment

  ---

  ## 🚨 Limitations & Constraints

  ### Technical Limitations
  - **File Size**: Maximum 20MB per PDF (configurable)
  - **File Format**: PDF files only
  - **Concurrency**: One analysis per session
  - **Storage**: No persistent data storage
  - **Language**: Primarily Spanish with English support

  ### Scalability Considerations
  - **Memory Usage**: Large PDFs processed in memory
  - **API Limits**: OpenAI rate limiting applies
  - **Session State**: No multi-user session management
  - **Caching**: No result caching implemented

  ---

  ## 🔄 Extensibility & Future Enhancements

  ### Planned Extensions
  - **Multiple Document Types**: Word, Excel, PowerPoint support
  - **Database Integration**: Persistent storage for analysis results
  - **User Authentication**: Multi-user support with sessions
  - **Batch Processing**: Multiple file analysis
  - **Advanced AI Models**: Custom fine-tuned models
  - **Export Features**: PDF reports, CSV exports
  - **Real-time Collaboration**: Shared document analysis

  ### Architecture Extensibility
  - **New Extractors**: Easy to add new text extraction services
  - **Multiple AI Providers**: Support for different LLM providers
  - **Plugin System**: Modular analysis plugins
  - **Microservices**: Service decomposition for scaling
  - **Event-Driven**: Async processing with message queues

  ---

  ## 📈 Performance Considerations

  ### Optimization Strategies
  - **Lazy Loading**: Components loaded on demand
  - **Code Splitting**: Route-based code splitting
  - **Image Optimization**: Next.js automatic image optimization
  - **Bundle Analysis**: Webpack bundle analyzer integration
  - **Caching**: Browser caching for static assets

  ### Monitoring & Observability
  - **Error Tracking**: Console logging and error boundaries
  - **Performance Metrics**: Core Web Vitals monitoring
  - **API Monitoring**: Response time and error rate tracking
  - **User Analytics**: Usage pattern analysis

  ---

  ## 🧪 Testing Strategy

  ### Testing Approach
  - **Unit Tests**: Core business logic testing
  - **Integration Tests**: API endpoint testing
  - **Component Tests**: React component testing
  - **E2E Tests**: Full user workflow testing
  - **Performance Tests**: Load and stress testing

  ### Recommended Testing Tools
  - **Jest**: Unit and integration testing
  - **React Testing Library**: Component testing
  - **Cypress**: End-to-end testing
  - **MSW**: API mocking for tests
  - **Lighthouse**: Performance auditing

  ---

  ## 📚 Additional Resources

  ### Documentation Files
  - **README.md**: Quick start guide and basic usage
  - **DEMO.md**: Step-by-step demo instructions
  - **PROJECT_SUMMARY.md**: Implementation status and features
  - **TROUBLESHOOTING.md**: Common issues and solutions

  ### Code Examples
  - **Simple Implementation**: `page-simple.tsx` for basic usage
  - **Advanced Features**: Full-featured components with error handling
  - **Configuration Examples**: Environment and build configurations

  ### External References
  - **Next.js Documentation**: https://nextjs.org/docs
  - **Material UI Guide**: https://mui.com/getting-started/
  - **OpenAI API Reference**: https://platform.openai.com/docs
  - **Clean Architecture**: Robert C. Martin's principles

  --- 

  This comprehensive documentation provides everything needed to understand, replicate, and extend the DocuMind architecture for similar proof-of-concept projects. The modular design and clean architecture principles ensure maintainability and scalability for future enhancements.
