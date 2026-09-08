/**
 * Reviews & Token Data Layer for ByJosh Portfolio
 *
 * Supports:
 * 1. Supabase Cloud Database (when VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are present)
 * 2. In-browser LocalStorage Fallback (so everything works out-of-the-box for testing)
 */

// Initial reviews list — empty by default awaiting real client submissions
const DEFAULT_REVIEWS = [];

// Default Supabase Cloud Connection credentials
export const DEFAULT_SB_URL = 'https://boftngybzscvrlzpixkp.supabase.co';
export const DEFAULT_SB_KEY = 'sb_publishable_v88I5haoILGnNTKZE6NZ5A_57wvGAXD';

const safeStorage = {
  getItem: (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
  setItem: (k, v) => { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); },
  removeItem: (k) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); }
};

export function getSupabaseConfig() {
  const url = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || safeStorage.getItem('byjosh_sb_url') || DEFAULT_SB_URL;
  const key = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || safeStorage.getItem('byjosh_sb_key') || DEFAULT_SB_KEY;
  return { url: url.replace(/\/$/, ''), key, isConfigured: Boolean(url && key) };
}

export function getAdminPIN() {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PIN) || safeStorage.getItem('byjosh_admin_pin') || 'josh2026';
}

export function setAdminPIN(newPin) {
  if (newPin && newPin.trim()) {
    safeStorage.setItem('byjosh_admin_pin', newPin.trim());
    return true;
  }
  return false;
}

export function saveSupabaseConfig(url, key) {
  if (url && key) {
    safeStorage.setItem('byjosh_sb_url', url.trim().replace(/\/$/, ''));
    safeStorage.setItem('byjosh_sb_key', key.trim());
    return true;
  }
  return false;
}

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
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
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
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
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
      const res = await fetch(`${sb.url}/rest/v1/review_tokens?order=created_at.desc`, {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
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
      // 1. Check if review already submitted with this token in Supabase
      const revCheck = await fetch(`${sb.url}/rest/v1/reviews?token=eq.${encodeURIComponent(cleanToken)}&select=id`, {
        headers: { 'apikey': sb.key, 'Authorization': `Bearer ${sb.key}` }
      });
      if (revCheck.ok) {
        const revs = await revCheck.json();
        if (revs && revs.length > 0) {
          return { valid: false, error: 'Este enlace ya fue utilizado anteriormente.' };
        }
      }

      // 2. Check token in Supabase review_tokens
      const res = await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(cleanToken)}`, {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const item = rows[0];
          if (item.used) {
            return { valid: false, error: 'Este enlace ya fue utilizado anteriormente.' };
          }
          return { valid: true, tokenData: item };
        }
      }
    } catch (err) {
      console.warn('Supabase token check failed, fallback to local:', err);
    }
  }

  // Check if token was already used on this client's browser
  const usedTokens = JSON.parse(safeStorage.getItem('byjosh_used_tokens') || '[]');
  if (usedTokens.includes(cleanToken)) {
    return { valid: false, error: 'Este enlace ya fue utilizado anteriormente.' };
  }

  // Local storage check (if generated on this same device)
  const localTokens = getLocalTokens();
  const found = localTokens.find(t => t.token === cleanToken);
  if (found) {
    if (found.used) {
      return { valid: false, error: 'Este enlace ya fue utilizado anteriormente.' };
    }
    return { valid: true, tokenData: found };
  }

  // Universal Client Link Compatibility:
  // If the link was sent to a client on Discord/WhatsApp, they are on a different device.
  // As long as the token has the ByJosh format (starts with 'bj-'), it is recognized as valid!
  if (cleanToken.startsWith('bj-')) {
    let service = 'Geometry Dash & Gaming';
    if (cleanToken.includes('thumb')) service = 'Thumbnails';
    else if (cleanToken.includes('banner') || cleanToken.includes('header')) service = 'Headers & Banners';
    else if (cleanToken.includes('pfp') || cleanToken.includes('avi')) service = 'Profile Pictures / AVIS';
    else if (cleanToken.includes('ui') || cleanToken.includes('overlay')) service = 'UI & Overlays';

    return {
      valid: true,
      tokenData: {
        token: cleanToken,
        service: service
      }
    };
  }

  return { valid: false, error: 'El enlace de reseña no es válido o ha expirado.' };
}

/**
 * Submit client review
 */
export async function submitReview({ token, name, handle, service, rating, comment }) {
  const reviewPayload = {
    token,
    name: name.trim(),
    handle: (handle || '').trim(),
    service: service || 'General Design',
    rating: parseInt(rating, 10) || 5,
    comment: comment.trim(),
    status: 'approved'
  };

  // Mark token as used on client device
  const usedTokens = JSON.parse(safeStorage.getItem('byjosh_used_tokens') || '[]');
  if (!usedTokens.includes(token)) {
    usedTokens.push(token);
    safeStorage.setItem('byjosh_used_tokens', JSON.stringify(usedTokens));
  }

  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      // 1. Insert review into Supabase (let PostgreSQL generate UUID)
      const resReview = await fetch(`${sb.url}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(reviewPayload)
      });

      // 2. Mark token as used in Supabase (or create if client link was offline)
      const patchRes = await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ used: true })
      });

      if (patchRes.ok) {
        const patched = await patchRes.json();
        if (!patched || patched.length === 0) {
          // Token wasn't in review_tokens yet, insert it recorded as used
          await fetch(`${sb.url}/rest/v1/review_tokens`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': sb.key,
              'Authorization': `Bearer ${sb.key}`
            },
            body: JSON.stringify({
              token,
              service: service || 'General Design',
              client_note: name.trim() + (handle ? ' (' + handle.trim() + ')' : ''),
              used: true
            })
          });
        }
      }

      if (resReview.ok) {
        const data = await resReview.json();
        return { success: true, review: data?.[0] || reviewPayload };
      }
    } catch (err) {
      console.warn('Supabase submit failed, saving locally:', err);
    }
  }

  // Local storage fallback
  const newReview = {
    ...reviewPayload,
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

  return { success: true, review: newReview };
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

  const token = 'bj-' + slug + '-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
  let tokenObj = {
    token,
    service: service || 'General Design',
    client_note: (clientNote || '').trim(),
    used: false
  };

  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/review_tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(tokenObj)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          return data[0];
        }
      }
    } catch (err) {
      console.warn('Supabase token save failed, fallback to local:', err);
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
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Supabase status update failed:', err);
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
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Supabase delete failed:', err);
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
        headers: { 'apikey': sb.key, 'Authorization': `Bearer ${sb.key}` }
      });
      if (checkRes.ok) {
        const rows = await checkRes.json();
        if (rows && rows.length > 0) {
          const newUsed = !rows[0].used;
          await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(tokenStr)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': sb.key,
              'Authorization': `Bearer ${sb.key}`
            },
            body: JSON.stringify({ used: newUsed })
          });
          return true;
        }
      }
    } catch (err) {
      console.warn('Supabase toggle token failed:', err);
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
    try {
      await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${encodeURIComponent(tokenStr)}`, {
        method: 'DELETE',
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
    } catch (err) {}
  }
  const tokens = getLocalTokens().filter(t => t.token !== tokenStr && t.id !== tokenStr);
  saveLocalTokens(tokens);
  return true;
}
