/**
 * Reviews & Token Data Layer for ByJosh Portfolio
 *
 * Supports:
 * 1. Supabase Cloud Database, configured only through VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 2. Browser-local preview data when Supabase is not configured (not shared or production-safe)
 */

import { getSupabaseConfig, getSupabaseHeaders } from './supabaseClient.js';

export { getSupabaseConfig } from './supabaseClient.js';

const safeStorage = {
  getItem: (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
  setItem: (k, v) => { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); },
  removeItem: (k) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); }
};

// ── Local Storage Helpers ───────────────────────────────────────────────────
function getLocalReviews() {
  try {
    const raw = safeStorage.getItem('byjosh_reviews');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Purge any previous sample placeholder reviews
    const cleaned = parsed.filter(r => !r.id?.startsWith('rev-sample-'));
    if (cleaned.length !== parsed.length) {
      saveLocalReviews(cleaned);
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

function saveLocalReviews(reviews) {
  safeStorage.setItem('byjosh_reviews', JSON.stringify(reviews));
}

function getLocalTokens() {
  try {
    const raw = safeStorage.getItem('byjosh_tokens');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTokens(tokens) {
  safeStorage.setItem('byjosh_tokens', JSON.stringify(tokens));
}

// ── Public API Methods ───────────────────────────────────────────────────────

/**
 * Fetch all approved reviews for public display
 */
export async function getApprovedReviews() {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/reviews?status=eq.approved&order=created_at.desc`, {
        headers: await getSupabaseHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local storage:', err);
    }
  }
  return getLocalReviews().filter(r => r.status === 'approved');
}

/**
 * Fetch all reviews for admin dashboard
 */
export async function getAllReviews() {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/reviews?order=created_at.desc`, {
        headers: await getSupabaseHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, fallback to local:', err);
    }
  }
  return getLocalReviews();
}

/**
 * Fetch all generated tokens for admin dashboard
 */
export async function getAllTokens() {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/review_tokens?secure_version=eq.true&order=created_at.desc`, {
        headers: await getSupabaseHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('Supabase tokens fetch failed, fallback to local:', err);
    }
  }
  return getLocalTokens();
}

/**
 * Validate a review token
 */
export async function validateToken(tokenStr) {
  if (!tokenStr || !tokenStr.trim()) {
    return { valid: false, error: 'Token no proporcionado.' };
  }
  const cleanToken = tokenStr.trim();
  const sb = getSupabaseConfig();

  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/rpc/validate_review_token`, {
        method: 'POST',
        headers: await getSupabaseHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ p_token: cleanToken })
      });
      if (!res.ok) throw new Error(`Token validation failed (${res.status})`);

      const result = await res.json();
      if (result?.valid === true) {
        return { valid: true, tokenData: { token: cleanToken, service: result.service } };
      }
      return { valid: false, error: 'Este enlace ya fue utilizado o no es válido.' };
    } catch (err) {
      console.error('Supabase token validation failed:', err);
      return { valid: false, error: 'No se pudo validar el enlace. Inténtalo de nuevo más tarde.' };
    }
  }

  // Local-only mode is for development. Tokens are never inferred from their prefix.
  let usedTokens = [];
  try {
    usedTokens = JSON.parse(safeStorage.getItem('byjosh_used_tokens') || '[]');
  } catch {}
  if (usedTokens.includes(cleanToken)) {
    return { valid: false, error: 'Este enlace ya fue utilizado anteriormente.' };
  }

  const localTokens = getLocalTokens();
  const found = localTokens.find(t => t.token === cleanToken);
  if (found) {
    if (found.secure_version !== true) {
      return { valid: false, error: 'Este enlace ya fue utilizado o no es válido.' };
    }
    if (found.used) {
      return { valid: false, error: 'Este enlace ya fue utilizado anteriormente.' };
    }
    return { valid: true, tokenData: found };
  }

  return { valid: false, error: 'El enlace de reseña no es válido o ha expirado.' };
}

/**
 * Submit client review
 */
export async function submitReview({ token, name, handle, service, rating, comment }) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/rpc/submit_review`, {
        method: 'POST',
        headers: await getSupabaseHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          p_token: token,
          p_name: name,
          p_handle: handle || '',
          p_rating: Number.parseInt(rating, 10),
          p_comment: comment
        })
      });
      if (!res.ok) throw new Error(`Review submission failed (${res.status})`);
      const result = await res.json();
      return { success: true, pending: true, review: result };
    } catch (err) {
      console.error('Supabase submit failed:', err);
      throw err;
    }
  }

  // Local-only mode is for development; it does not provide cross-device security.
  const validated = await validateToken(token);
  if (!validated.valid) throw new Error(validated.error);
  const newReview = {
    token,
    name: String(name || '').trim(),
    handle: String(handle || '').trim(),
    service: validated.tokenData.service || service || 'General Design',
    rating: Number.parseInt(rating, 10) || 5,
    comment: String(comment || '').trim(),
    status: 'pending',
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString()
  };
  const reviews = getLocalReviews();
  reviews.unshift(newReview);
  saveLocalReviews(reviews);

  const tokens = getLocalTokens();
  const tokenIdx = tokens.findIndex(t => t.token === token);
  if (tokenIdx !== -1) {
    tokens[tokenIdx].used = true;
    saveLocalTokens(tokens);
  }

  return { success: true, pending: true, review: newReview };
}

export async function addAdminReview({ name, handle, service, rating, comment }) {
  const sb = getSupabaseConfig();
  const reviewPayload = {
    token: `admin-${crypto.randomUUID()}`,
    name: String(name || '').trim(),
    handle: String(handle || '').trim(),
    service: String(service || 'General Design').trim(),
    rating: Number.parseInt(rating, 10),
    comment: String(comment || '').trim(),
    status: 'approved'
  };

  if (sb.isConfigured) {
    const res = await fetch(`${sb.url}/rest/v1/reviews`, {
      method: 'POST',
      headers: await getSupabaseHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }),
      body: JSON.stringify(reviewPayload)
    });
    if (!res.ok) throw new Error(`Admin review insert failed (${res.status})`);
    const rows = await res.json();
    return rows?.[0] || reviewPayload;
  }

  const localReview = {
    ...reviewPayload,
    id: 'rev-' + Date.now(),
    created_at: new Date().toISOString()
  };
  const reviews = getLocalReviews();
  reviews.unshift(localReview);
  saveLocalReviews(reviews);
  return localReview;
}

/**
 * Generate a new unique token for a client
 */
export async function generateReviewToken({ service, clientNote }) {
  let slug = 'gen';
  const sLow = (service || '').toLowerCase();
  if (sLow.includes('thumb')) slug = 'thumb';
  else if (sLow.includes('banner') || sLow.includes('header')) slug = 'banner';
  else if (sLow.includes('pfp') || sLow.includes('avi') || sLow.includes('profile')) slug = 'pfp';
  else if (sLow.includes('ui') || sLow.includes('overlay')) slug = 'ui';

  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const randomPart = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const token = `bj-${slug}-${randomPart}`;
  let tokenObj = {
    token,
    service: service || 'General Design',
    client_note: (clientNote || '').trim(),
    used: false,
    secure_version: true
  };

  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/review_tokens`, {
        method: 'POST',
        headers: await getSupabaseHeaders({
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }),
        body: JSON.stringify(tokenObj)
      });
      if (!res.ok) throw new Error(`Supabase token creation failed (${res.status})`);
      const data = await res.json();
      if (data && data[0]) return data[0];
      throw new Error('Supabase did not return the created token.');
    } catch (err) {
      console.error('Supabase token save failed:', err);
      throw err;
    }
  }

  tokenObj.id = 'tok-' + Date.now();
  tokenObj.created_at = new Date().toISOString();
  const tokens = getLocalTokens();
  tokens.unshift(tokenObj);
  saveLocalTokens(tokens);
  return tokenObj;
}

/**
 * Update review status ('approved', 'hidden', 'pending')
 */
export async function updateReviewStatus(id, newStatus) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/reviews?id=eq.${id}`, {
        method: 'PATCH',
        headers: await getSupabaseHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(`Supabase status update failed (${res.status})`);
      return true;
    } catch (err) {
      console.error('Supabase status update failed:', err);
      throw err;
    }
  }

  const reviews = getLocalReviews();
  const item = reviews.find(r => r.id === id);
  if (item) {
    item.status = newStatus;
    saveLocalReviews(reviews);
    return true;
  }
  return false;
}

/**
 * Delete a review
 */
export async function deleteReview(id) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/reviews?id=eq.${id}`, {
        method: 'DELETE',
        headers: await getSupabaseHeaders()
      });
      if (!res.ok) throw new Error(`Supabase review deletion failed (${res.status})`);
      return true;
    } catch (err) {
      console.error('Supabase delete failed:', err);
      throw err;
    }
  }

  const reviews = getLocalReviews().filter(r => r.id !== id);
  saveLocalReviews(reviews);
  return true;
}

/**
 * Toggle token used state
 */
export async function toggleTokenUsed(tokenStr) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const checkRes = await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(tokenStr)}`, {
        headers: await getSupabaseHeaders()
      });
      if (!checkRes.ok) throw new Error(`Supabase token lookup failed (${checkRes.status})`);
      const rows = await checkRes.json();
      if (!rows?.length) return false;
      const patchRes = await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(tokenStr)}`, {
        method: 'PATCH',
        headers: await getSupabaseHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ used: !rows[0].used })
      });
      if (!patchRes.ok) throw new Error(`Supabase token update failed (${patchRes.status})`);
      return true;
    } catch (err) {
      console.error('Supabase toggle token failed:', err);
      throw err;
    }
  }

  const tokens = getLocalTokens();
  const item = tokens.find(t => t.token === tokenStr || t.id === tokenStr);
  if (item) {
    item.used = !item.used;
    saveLocalTokens(tokens);
    return true;
  }
  return false;
}

/**
 * Delete a token
 */
export async function deleteToken(tokenStr) {
  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    const res = await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(tokenStr)}`, {
      method: 'DELETE',
      headers: await getSupabaseHeaders()
    });
    if (!res.ok) throw new Error(`Supabase token deletion failed (${res.status})`);
    return true;
  }
  const tokens = getLocalTokens().filter(t => t.token !== tokenStr && t.id !== tokenStr);
  saveLocalTokens(tokens);
  return true;
}
