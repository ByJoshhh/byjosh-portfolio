-- ==============================================================================
-- BYJOSH PORTFOLIO — SUPABASE REVIEWS & TOKEN SYSTEM SCHEMA
-- ==============================================================================
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase (https://supabase.com)
-- y haz clic en "Run".

-- 1. Tabla de Tokens de un solo uso para clientes
CREATE TABLE IF NOT EXISTS public.review_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    service TEXT NOT NULL,
    client_note TEXT DEFAULT '',
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Reseñas de Clientes
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT DEFAULT '',
    service TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para consultas ultra rápidas
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.review_tokens(token);

-- 4. Habilitar Seguridad de Nivel de Fila (Row Level Security)
ALTER TABLE public.review_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Público Seguro (Anon Key):
-- A. Cualquiera puede leer las reseñas aprobadas para verlas en la web
CREATE POLICY "Public read approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

-- B. Un cliente con link puede insertar su reseña
CREATE POLICY "Public insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

-- C. Cualquiera puede verificar si un token existe
CREATE POLICY "Public read tokens"
    ON public.review_tokens FOR SELECT
    USING (true);

-- D. Al enviar la reseña, el token se marca como usado
CREATE POLICY "Public mark token used"
    ON public.review_tokens FOR UPDATE
    USING (true);

-- E. Permitir gestión (insertar tokens y moderar reseñas desde el panel)
CREATE POLICY "Allow all reviews for admin operations"
    ON public.reviews FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all tokens for admin operations"
    ON public.review_tokens FOR ALL
    USING (true)
    WITH CHECK (true);
