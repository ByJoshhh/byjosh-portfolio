/**
 * Reviews & Token Data Layer for ByJosh Portfolio
 *
 * Supports:
 * 1. Supabase Cloud Database (when VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are present)
 * 2. In-browser LocalStorage Fallback (so everything works out-of-the-box for testing)
 */

// Initial reviews list — empty by default awaiting real client submissions
const DEFAULT_REVIEWS = [];

function getSupabaseConfig() {
  const url = import.meta.env?.VITE_SUPABASE_URL || localStorage.getItem('byjosh_sb_url') || '';
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('byjosh_sb_key') || '';
  return { url: url.replace(/\/$/, ''), key, isConfigured: Boolean(url && key) };
}

export function getAdminPIN() {
  return import.meta.env?.VITE_ADMIN_PIN || localStorage.getItem('byjosh_admin_pin') || 'josh2026';
}

export function setAdminPIN(newPin) {
  if (newPin && newPin.trim()) {
    localStorage.setItem('byjosh_admin_pin', newPin.trim());
    return true;
  }
  return false;
}

export function saveSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('byjosh_sb_url', url.trim().replace(/\/$/, ''));
    localStorage.setItem('byjosh_sb_key', key.trim());
    return true;
  }
  return false;
}

// ── Local Storage Helpers ───────────────────────────────────────────────────
function getLocalReviews() {
  try {
    const raw = localStorage.getItem('byjosh_reviews');
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
  localStorage.setItem('byjosh_reviews', JSON.stringify(reviews));
}

function getLocalTokens() {
  try {
    const raw = localStorage.getItem('byjosh_tokens');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTokens(tokens) {
  localStorage.setItem('byjosh_tokens', JSON.stringify(tokens));
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
        if (Array.isArray(data) && data.length > 0) return data;
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
        return await res.json();
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
        return await res.json();
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
      const res = await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${cleanToken}`, {
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
  const usedTokens = JSON.parse(localStorage.getItem('byjosh_used_tokens') || '[]');
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
  const newReview = {
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    token,
    name: name.trim(),
    handle: (handle || '').trim(),
    service: service || 'General Design',
    rating: parseInt(rating, 10) || 5,
    comment: comment.trim(),
    status: 'approved',
    created_at: new Date().toISOString()
  };

  // Mark token as used on client device
  const usedTokens = JSON.parse(localStorage.getItem('byjosh_used_tokens') || '[]');
  if (!usedTokens.includes(token)) {
    usedTokens.push(token);
    localStorage.setItem('byjosh_used_tokens', JSON.stringify(usedTokens));
  }

  const sb = getSupabaseConfig();
  if (sb.isConfigured) {
    try {
      // 1. Insert review
      const resReview = await fetch(`${sb.url}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(newReview)
      });

      // 2. Mark token as used in Supabase
      await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        },
        body: JSON.stringify({ used: true })
      });

      if (resReview.ok) {
        return { success: true, review: newReview };
      }
    } catch (err) {
      console.warn('Supabase submit failed, saving locally:', err);
    }
  }


  // Local storage fallback
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
  const tokenObj = {
    id: 'tok-' + Date.now(),
    token,
    service: service || 'General Design',
    client_note: (clientNote || '').trim(),
    used: false,
    created_at: new Date().toISOString()
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
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(tokenObj)
      });
      if (res.ok) {
        return tokenObj;
      }
    } catch (err) {
      console.warn('Supabase token save failed, fallback to local:', err);
    }
  }

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
  const tokens = getLocalTokens();
  const item = tokens.find(t => t.token === tokenStr || t.id === tokenStr);
  if (item) {
    item.used = !item.used;
    saveLocalTokens(tokens);

    if (sb.isConfigured) {
      try {
        await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${item.token}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': sb.key,
            'Authorization': `Bearer ${sb.key}`
          },
          body: JSON.stringify({ used: item.used })
        });
      } catch (err) {}
    }
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
      await fetch(`${sb.url}/rest/v1/review_tokens?token=eq.${tokenStr}`, {
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
