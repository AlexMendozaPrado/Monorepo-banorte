# Banorte Financial App

Aplicación financiera construida con Clean Architecture.

## Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI Integration

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Arquitectura

Esta aplicación sigue Clean Architecture con las siguientes capas:

- **Domain Layer**: Entidades, Value Objects, Excepciones y Ports
- **Application Layer**: Use Cases y DTOs
- **Infrastructure Layer**: Implementaciones de servicios externos y DI Container
- **Presentation Layer**: Componentes UI y páginas Next.js
