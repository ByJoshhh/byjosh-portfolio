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
    secure_version BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
UPDATE public.review_tokens SET used = FALSE WHERE used IS NULL;
ALTER TABLE public.review_tokens ALTER COLUMN used SET DEFAULT FALSE;
ALTER TABLE public.review_tokens ALTER COLUMN used SET NOT NULL;
ALTER TABLE public.review_tokens
    ADD COLUMN IF NOT EXISTS secure_version BOOLEAN NOT NULL DEFAULT FALSE;

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

-- 5. Lista cerrada de administradores. Agrega aquí solo los UUID de cuentas creadas en Supabase Auth.
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;
DROP POLICY IF EXISTS "Admin users can read own membership" ON public.admin_users;
CREATE POLICY "Admin users can read own membership"
    ON public.admin_users FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = (SELECT auth.uid())
    );
$$;
ALTER FUNCTION public.is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Las reseñas solo se publican mediante la función segura del final del archivo.
REVOKE ALL PRIVILEGES ON TABLE public.reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reviews TO authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.review_tokens FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.review_tokens TO authenticated;

DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public read tokens" ON public.review_tokens;
DROP POLICY IF EXISTS "Public mark token used" ON public.review_tokens;
DROP POLICY IF EXISTS "Allow all reviews for admin operations" ON public.reviews;
DROP POLICY IF EXISTS "Allow all tokens for admin operations" ON public.review_tokens;
DROP POLICY IF EXISTS "Reviews public read approved" ON public.reviews;
CREATE POLICY "Reviews public read approved"
    ON public.reviews FOR SELECT TO anon, authenticated
    USING (status = 'approved');
DROP POLICY IF EXISTS "Reviews admin manage" ON public.reviews;
CREATE POLICY "Reviews admin manage"
    ON public.reviews FOR ALL TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "Review tokens admin manage" ON public.review_tokens;
CREATE POLICY "Review tokens admin manage"
    ON public.review_tokens FOR ALL TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

-- ==============================================================================
-- 6. Storage Bucket para Imágenes del Portafolio
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read storage" ON storage.objects;
CREATE POLICY "Public read storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio');

REVOKE ALL PRIVILEGES ON TABLE storage.objects FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE storage.objects TO authenticated;
DROP POLICY IF EXISTS "Public upload storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete storage" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio admin upload" ON storage.objects;
CREATE POLICY "Portfolio admin upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'portfolio' AND (SELECT public.is_admin()));
DROP POLICY IF EXISTS "Portfolio admin update" ON storage.objects;
CREATE POLICY "Portfolio admin update"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'portfolio' AND (SELECT public.is_admin()))
    WITH CHECK (bucket_id = 'portfolio' AND (SELECT public.is_admin()));
DROP POLICY IF EXISTS "Portfolio admin delete" ON storage.objects;
CREATE POLICY "Portfolio admin delete"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'portfolio' AND (SELECT public.is_admin()));

-- ==============================================================================
-- 7. Tabla de Proyectos Dinámicos del Portafolio
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    cat TEXT NOT NULL,
    img TEXT NOT NULL,
    bg TEXT DEFAULT 'linear-gradient(135deg, #1a1e3a, #0b0d14)',
    is_new BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.projects FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;

DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects"
    ON public.projects FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Public manage projects" ON public.projects;
DROP POLICY IF EXISTS "Projects admin manage" ON public.projects;
CREATE POLICY "Projects admin manage"
    ON public.projects FOR ALL TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

-- ==============================================================================
-- 8. Tabla de Planes de Precios
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_es TEXT NOT NULL,
    category_en TEXT NOT NULL,
    category_es TEXT NOT NULL,
    price NUMERIC NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.pricing_plans FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.pricing_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pricing_plans TO authenticated;

DROP POLICY IF EXISTS "Public read pricing" ON public.pricing_plans;
CREATE POLICY "Public read pricing"
    ON public.pricing_plans FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Public manage pricing" ON public.pricing_plans;
DROP POLICY IF EXISTS "Pricing admin manage" ON public.pricing_plans;
CREATE POLICY "Pricing admin manage"
    ON public.pricing_plans FOR ALL TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

-- Insertar planes iniciales por defecto si no existen
INSERT INTO public.pricing_plans (id, title_en, title_es, category_en, category_es, price, popular, order_index)
VALUES 
    ('thumbnails', 'Thumbnails', 'Miniaturas', 'Geometry Dash & Gaming', 'Geometry Dash y Gaming', 4.50, true, 1),
    ('pfps', 'Profile Pictures / AVIS', 'Profile Pictures / AVIS', 'PFPs & Icons', 'PFPs e Íconos', 4.00, false, 2),
    ('headers', 'Headers & Banners', 'Headers & Banners', 'Twitter, YouTube, Twitch', 'Twitter, YouTube, Twitch', 7.00, true, 3),
    ('ui', 'UI & Overlays', 'Interfaces & Overlays', 'Stream Packs & Web UI', 'Stream Packs & Web UI', 10.50, false, 4)
ON CONFLICT (id) DO NOTHING;

-- Keep previously submitted links consumed before switching to the RPC flow.
UPDATE public.review_tokens AS tokens
SET used = TRUE
FROM public.reviews AS reviews
WHERE reviews.token = tokens.token;

UPDATE public.reviews SET status = 'pending' WHERE status IS NULL;
ALTER TABLE public.reviews ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.reviews ALTER COLUMN status SET NOT NULL;

-- Public token lookup exposes only validity and service, never the token list or client notes.
CREATE OR REPLACE FUNCTION public.validate_review_token(p_token TEXT)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    token_row RECORD;
BEGIN
    SELECT token, service, used
    INTO token_row
    FROM public.review_tokens
    WHERE token = pg_catalog.btrim(COALESCE(p_token, ''))
      AND secure_version = TRUE
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object('valid', FALSE);
    END IF;
    IF token_row.used THEN
        RETURN pg_catalog.jsonb_build_object('valid', FALSE);
    END IF;

    RETURN pg_catalog.jsonb_build_object(
        'valid', TRUE,
        'service', token_row.service
    );
END;
$$;
ALTER FUNCTION public.validate_review_token(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.validate_review_token(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_review_token(TEXT) TO anon, authenticated;

-- Token consumption and review insertion happen atomically in one transaction.
CREATE OR REPLACE FUNCTION public.submit_review(
    p_token TEXT,
    p_name TEXT,
    p_handle TEXT,
    p_rating INTEGER,
    p_comment TEXT
)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    token_service TEXT;
    review_id UUID;
    clean_name TEXT := pg_catalog.btrim(COALESCE(p_name, ''));
    clean_handle TEXT := pg_catalog.btrim(COALESCE(p_handle, ''));
    clean_comment TEXT := pg_catalog.btrim(COALESCE(p_comment, ''));
BEGIN
    IF pg_catalog.char_length(clean_name) NOT BETWEEN 1 AND 40
       OR pg_catalog.char_length(clean_handle) > 50
       OR pg_catalog.char_length(clean_comment) NOT BETWEEN 1 AND 600
       OR p_rating IS NULL OR p_rating NOT BETWEEN 1 AND 5
       OR pg_catalog.char_length(COALESCE(p_token, '')) > 128 THEN
        RAISE EXCEPTION 'Invalid review fields' USING ERRCODE = '22023';
    END IF;

    UPDATE public.review_tokens AS tokens
    SET used = TRUE
    WHERE tokens.token = pg_catalog.btrim(p_token)
      AND tokens.secure_version = TRUE
      AND tokens.used = FALSE
    RETURNING tokens.service INTO token_service;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Review link is invalid or already used' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.reviews (token, name, handle, service, rating, comment, status)
    VALUES (
        pg_catalog.btrim(p_token),
        clean_name,
        clean_handle,
        token_service,
        p_rating,
        clean_comment,
        'pending'
    )
    RETURNING id INTO review_id;

    RETURN pg_catalog.jsonb_build_object('success', TRUE, 'id', review_id, 'status', 'pending');
END;
$$;
ALTER FUNCTION public.submit_review(TEXT, TEXT, TEXT, INTEGER, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.submit_review(TEXT, TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_review(TEXT, TEXT, TEXT, INTEGER, TEXT) TO anon, authenticated;

-- ==============================================================================
-- 9. Tabla de Categorías Dinámicas
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_es TEXT NOT NULL,
    badge TEXT DEFAULT '',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ALTER COLUMN order_index TYPE BIGINT;
REVOKE ALL PRIVILEGES ON TABLE public.categories FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
    ON public.categories FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Public manage categories" ON public.categories;
DROP POLICY IF EXISTS "Categories admin manage" ON public.categories;
CREATE POLICY "Categories admin manage"
    ON public.categories FOR ALL TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

-- Insertar categorías iniciales por defecto si no existen
INSERT INTO public.categories (id, name_en, name_es, badge, order_index)
VALUES 
    ('geometry-dash', 'Geometry Dash', 'Geometry Dash', 'NEW', 1),
    ('esports', 'E-Sports', 'E-Sports', 'NEW', 2),
    ('thumbnails', 'Thumbnails', 'Miniaturas', 'NEW', 3),
    ('discord-banners', 'Discord Banners', 'Banners de Discord', '', 4),
    ('anime-backgrounds', 'Anime Backgrounds', 'Fondos de Anime', '', 5),
    ('pfps', 'AVIs/pfps', 'AVIs/pfps', '', 6),
    ('banners', 'Banners', 'Banners', '', 7),
    ('headers', 'Headers', 'Headers', '', 8)
ON CONFLICT (id) DO NOTHING;

