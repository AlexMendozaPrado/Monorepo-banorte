# ⚠️ ACCIÓN REQUERIDA: Aplicar Migración SQL

## El problema detectado:

La función `match_documents` en tu base de datos **todavía tiene el bug**. Necesitas ejecutar la migración para arreglarlo.

## Opción 1: Supabase Dashboard (MÁS FÁCIL) ⭐

1. Ve a: https://app.supabase.com/project/xcojnmxoulawxqipnwxo/sql/new

2. Copia y pega este SQL:

```sql
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

3. Haz clic en **"Run"** (abajo a la derecha)

4. Deberías ver: "Success. No rows returned"

## Opción 2: Desde la terminal

Si tienes `psql` instalado:

```bash
psql "postgresql://postgres.xcojnmxoulawxqipnwxo:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f database/supabase/migrations/002_fix_match_documents.sql
```

## ¿Cómo saber si funcionó?

Después de ejecutar la migración:

1. Recarga la página: http://localhost:3000
2. Prueba hacer una pregunta de nuevo
3. Deberías ver en los logs del servidor:
   ```
   [SupabaseVectorStore] Raw results from Supabase: 5 documents  ✅
   ```

## Link directo al SQL Editor de tu proyecto:

https://app.supabase.com/project/xcojnmxoulawxqipnwxo/sql/new

---

**Nota**: El cambio importante es en la línea WHERE:
- ❌ Antes: `WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold`
- ✅ Ahora: `WHERE 1 - (documents.embedding <=> query_embedding) >= match_threshold`
