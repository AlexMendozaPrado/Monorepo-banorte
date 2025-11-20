# Aplicar Migraciones de Base de Datos

## Pasos para aplicar la migración 002_fix_match_documents.sql

### Opción 1: Usando Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en https://app.supabase.com
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `002_fix_match_documents.sql`
5. Ejecuta la query (Run button)
6. Verifica que no haya errores

### Opción 2: Usando Supabase CLI

```bash
# Asegúrate de tener Supabase CLI instalado
npm install -g supabase

# Inicia sesión (si aún no lo has hecho)
supabase login

# Aplica la migración
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Opción 3: Script SQL directo

Conecta a tu base de datos de Supabase y ejecuta:

```sql
-- Fix match_documents function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  chunk_index INTEGER,
  parent_document_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.title,
    documents.content,
    documents.metadata,
    documents.chunk_index,
    documents.parent_document_id,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) >= match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Actualizar variables de entorno

Después de aplicar la migración, actualiza tu archivo `.env.local`:

```bash
# Cambia esto:
RAG_SIMILARITY_THRESHOLD=0.7

# Por esto:
RAG_SIMILARITY_THRESHOLD=0.3
```

Luego reinicia tu servidor de desarrollo:

```bash
npm run dev
```

## Verificar el fix

Después de aplicar la migración y actualizar las variables de entorno, puedes verificar que funcione correctamente visitando:

http://localhost:3001/api/debug/rag

Deberías ver resultados con el threshold 0.3 y 0.5.

## ¿Qué se arregló?

1. **Operador de comparación**: Cambiado de `>` a `>=` para incluir valores exactos en el threshold
2. **Threshold por defecto**: Bajado de 0.7 a 0.3 para obtener más resultados relevantes
3. **Documentación**: Agregada mejor documentación sobre rangos de similitud típicos

## Rangos de similitud recomendados

- **0.0 - 0.2**: Documentos muy diferentes (no recomendado)
- **0.2 - 0.3**: Documentos algo relacionados (mínimo threshold)
- **0.3 - 0.4**: Documentos relacionados (threshold recomendado)
- **0.4 - 0.6**: Documentos muy relacionados (buena relevancia)
- **0.6+**: Documentos extremadamente similares (excelente relevancia)

Para tu caso con 62 documentos de Banorte, un threshold de 0.3 debería darte buenos resultados.
