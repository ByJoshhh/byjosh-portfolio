/**
 * CMS Data Layer for ByJosh Portfolio (Supabase Cloud + Local Fallback)
 * 
 * Manages:
 * 1. Dynamic Pricing Plans
 * 2. Supabase Storage Image Uploads
 * 3. Dynamic Portfolio Projects (CMS Gallery)
 * 4. Dynamic Categories & Filters
 */
import { getSupabaseConfig } from './reviewsDB.js';

const safeStorage = {
  getItem: (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
  setItem: (k, v) => { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); },
  removeItem: (k) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); }
};

// Default static fallbacks
export const DEFAULT_PRICING_PLANS = [
  {
    id: 'thumbnails',
    title_en: 'Thumbnails',
    title_es: 'Miniaturas',
    category_en: 'Geometry Dash & Gaming',
    category_es: 'Geometry Dash y Gaming',
    price: 4.50,
    popular: true,
    order_index: 1
  },
  {
    id: 'pfps',
    title_en: 'Profile Pictures / AVIS',
    title_es: 'Profile Pictures / AVIS',
    category_en: 'PFPs & Icons',
    category_es: 'PFPs e Íconos',
    price: 4.00,
    popular: false,
    order_index: 2
  },
  {
    id: 'headers',
    title_en: 'Headers & Banners',
    title_es: 'Headers & Banners',
    category_en: 'Twitter, YouTube, Twitch',
    category_es: 'Twitter, YouTube, Twitch',
    price: 7.00,
    popular: true,
    order_index: 3
  },
  {
    id: 'ui',
    title_en: 'UI & Overlays',
    title_es: 'Interfaces & Overlays',
    category_en: 'Stream Packs & Web UI',
    category_es: 'Stream Packs & Web UI',
    price: 10.50,
    popular: false,
    order_index: 4
  }
];

export const DEFAULT_CATEGORIES = [
  { id: 'geometry-dash', name_en: 'Geometry Dash', name_es: 'Geometry Dash', badge: 'NEW', order_index: 1 },
  { id: 'esports', name_en: 'E-Sports', name_es: 'E-Sports', badge: 'NEW', order_index: 2 },
  { id: 'thumbnails', name_en: 'Thumbnails', name_es: 'Miniaturas', badge: 'NEW', order_index: 3 },
  { id: 'discord-banners', name_en: 'Discord Banners', name_es: 'Banners de Discord', badge: '', order_index: 4 },
  { id: 'anime-backgrounds', name_en: 'Anime Backgrounds', name_es: 'Fondos de Anime', badge: '', order_index: 5 },
  { id: 'pfps', name_en: 'AVIs/pfps', name_es: 'AVIs/pfps', badge: '', order_index: 6 },
  { id: 'banners', name_en: 'Banners', name_es: 'Banners', badge: '', order_index: 7 },
  { id: 'headers', name_en: 'Headers', name_es: 'Headers', badge: '', order_index: 8 }
];

// ==============================================================================
// 1. PRICING PLANS
// ==============================================================================
export async function getPricingPlans() {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/pricing_plans?order=order_index.asc`, {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          safeStorage.setItem('byjosh_pricing_cache', JSON.stringify(rows));
          return rows;
        }
      }
    } catch (err) {
      console.warn('Supabase getPricingPlans failed, using cache:', err);
    }
  }

  const cached = safeStorage.getItem('byjosh_pricing_cache');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return DEFAULT_PRICING_PLANS;
}

export async function updatePricingPlan(id, updates) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/pricing_plans?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        },
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      });
      if (res.ok) {
        // Invalidate local cache
        safeStorage.removeItem('byjosh_pricing_cache');
        return true;
      }
    } catch (err) {
      console.warn('Supabase updatePricingPlan failed:', err);
    }
  }

  // Local cache update
  const plans = await getPricingPlans();
  const idx = plans.findIndex(p => p.id === id);
  if (idx !== -1) {
    plans[idx] = { ...plans[idx], ...updates };
    safeStorage.setItem('byjosh_pricing_cache', JSON.stringify(plans));
    return true;
  }
  return false;
}

// ==============================================================================
// 2. CATEGORIES & FILTERS
// ==============================================================================
export async function getCategories() {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/categories?order=order_index.asc`, {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          safeStorage.setItem('byjosh_categories_cache', JSON.stringify(rows));
          return rows;
        }
      }
    } catch (err) {
      console.warn('Supabase getCategories failed, using cache:', err);
    }
  }

  const cached = safeStorage.getItem('byjosh_categories_cache');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return DEFAULT_CATEGORIES;
}

export async function addCategory({ id, name_en, name_es, badge }) {
  const cleanId = (id || name_en).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const newCat = {
    id: cleanId,
    name_en: (name_en || '').trim(),
    name_es: (name_es || name_en || '').trim(),
    badge: (badge || '').trim(),
    order_index: Date.now()
  };

  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        safeStorage.removeItem('byjosh_categories_cache');
        return { success: true, category: newCat };
      }
    } catch (err) {
      console.warn('Supabase addCategory failed:', err);
    }
  }

  const cats = await getCategories();
  cats.push(newCat);
  safeStorage.setItem('byjosh_categories_cache', JSON.stringify(cats));
  return { success: true, category: newCat };
}

export async function deleteCategory(id) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      await fetch(`${sb.url}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      safeStorage.removeItem('byjosh_categories_cache');
      return true;
    } catch (err) {}
  }

  const cats = (await getCategories()).filter(c => c.id !== id);
  safeStorage.setItem('byjosh_categories_cache', JSON.stringify(cats));
  return true;
}

// ==============================================================================
// 3. STORAGE IMAGE UPLOAD
// ==============================================================================
export async function uploadProjectImage(file) {
  if (!file) throw new Error('No file provided');

  const sb = getSupabaseConfig();
  if (!sb.isConfigured) {
    throw new Error('Supabase is not configured. Please verify connection.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `uploads/${Date.now()}-${cleanName}`;
  const uploadUrl = `${sb.url}/storage/v1/object/portfolio/${filePath}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey': sb.key,
      'Authorization': `Bearer ${sb.key}`,
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload error (${res.status}): ${errorText}`);
  }

  // Return permanent public URL
  return `${sb.url}/storage/v1/object/public/portfolio/${filePath}`;
}

// ==============================================================================
// 4. DYNAMIC PROJECTS (CMS GALLERY)
// ==============================================================================
export async function getDynamicProjects() {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/projects?order=created_at.desc`, {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          safeStorage.setItem('byjosh_dynamic_projects', JSON.stringify(rows));
          return rows;
        }
      }
    } catch (err) {
      console.warn('Supabase getDynamicProjects failed, using local:', err);
    }
  }

  const raw = safeStorage.getItem('byjosh_dynamic_projects');
  return raw ? JSON.parse(raw) : [];
}

export async function addDynamicProject({ title, cat, img, bg, is_new }) {
  const projectObj = {
    title: (title || '').trim(),
    cat: (cat || 'featured').trim(),
    img: (img || '').trim(),
    bg: bg || 'linear-gradient(135deg, #1a1e3a, #0b0d14)',
    is_new: Boolean(is_new)
  };

  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(projectObj)
      });
      if (res.ok) {
        const data = await res.json();
        const created = data?.[0] || projectObj;
        // Invalidate cache
        safeStorage.removeItem('byjosh_dynamic_projects');
        return { success: true, project: created };
      }
    } catch (err) {
      console.warn('Supabase addDynamicProject failed:', err);
    }
  }

  // Fallback to local storage
  const local = await getDynamicProjects();
  const fallback = {
    ...projectObj,
    id: 'proj-' + Date.now(),
    created_at: new Date().toISOString()
  };
  local.unshift(fallback);
  safeStorage.setItem('byjosh_dynamic_projects', JSON.stringify(local));
  return { success: true, project: fallback };
}

export async function deleteDynamicProject(id, imgUrl) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      // 1. Delete row from table
      await fetch(`${sb.url}/rest/v1/projects?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });

      // 2. If image is in Supabase storage, delete it as well
      if (imgUrl && imgUrl.includes('/storage/v1/object/public/portfolio/')) {
        const filePath = imgUrl.split('/storage/v1/object/public/portfolio/')[1];
        if (filePath) {
          await fetch(`${sb.url}/storage/v1/object/portfolio/${filePath}`, {
            method: 'DELETE',
            headers: {
              'apikey': sb.key,
              'Authorization': `Bearer ${sb.key}`
            }
          });
        }
      }
      safeStorage.removeItem('byjosh_dynamic_projects');
      return true;
    } catch (err) {
      console.warn('Supabase delete project failed:', err);
    }
  }

  const local = (await getDynamicProjects()).filter(p => p.id !== id);
  safeStorage.setItem('byjosh_dynamic_projects', JSON.stringify(local));
  return true;
}
