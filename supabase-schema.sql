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

-- 5. Políticas de Acceso Público Seguro (Anon Key):
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

DROP POLICY IF EXISTS "Public insert reviews" ON public.reviews;
CREATE POLICY "Public insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public read tokens" ON public.review_tokens;
CREATE POLICY "Public read tokens"
    ON public.review_tokens FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public mark token used" ON public.review_tokens;
CREATE POLICY "Public mark token used"
    ON public.review_tokens FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Allow all reviews for admin operations" ON public.reviews;
CREATE POLICY "Allow all reviews for admin operations"
    ON public.reviews FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all tokens for admin operations" ON public.review_tokens;
CREATE POLICY "Allow all tokens for admin operations"
    ON public.review_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

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

DROP POLICY IF EXISTS "Public upload storage" ON storage.objects;
CREATE POLICY "Public upload storage"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Public delete storage" ON storage.objects;
CREATE POLICY "Public delete storage"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'portfolio');

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

DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects"
    ON public.projects FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public manage projects" ON public.projects;
CREATE POLICY "Public manage projects"
    ON public.projects FOR ALL
    USING (true)
    WITH CHECK (true);

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

DROP POLICY IF EXISTS "Public read pricing" ON public.pricing_plans;
CREATE POLICY "Public read pricing"
    ON public.pricing_plans FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public manage pricing" ON public.pricing_plans;
CREATE POLICY "Public manage pricing"
    ON public.pricing_plans FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insertar planes iniciales por defecto si no existen
INSERT INTO public.pricing_plans (id, title_en, title_es, category_en, category_es, price, popular, order_index)
VALUES 
    ('thumbnails', 'Thumbnails', 'Miniaturas', 'Geometry Dash & Gaming', 'Geometry Dash y Gaming', 4.50, true, 1),
    ('pfps', 'Profile Pictures / AVIS', 'Profile Pictures / AVIS', 'PFPs & Icons', 'PFPs e Íconos', 4.00, false, 2),
    ('headers', 'Headers & Banners', 'Headers & Banners', 'Twitter, YouTube, Twitch', 'Twitter, YouTube, Twitch', 7.00, true, 3),
    ('ui', 'UI & Overlays', 'Interfaces & Overlays', 'Stream Packs & Web UI', 'Stream Packs & Web UI', 10.50, false, 4)
ON CONFLICT (id) DO NOTHING;

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

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public manage categories" ON public.categories;
CREATE POLICY "Public manage categories"
    ON public.categories FOR ALL
    USING (true)
    WITH CHECK (true);

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

