import { createClient } from '@supabase/supabase-js';

const url = import.meta.env?.VITE_SUPABASE_URL || '';
const key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env?.VITE_SUPABASE_ANON_KEY
  || '';
let client;

export function getSupabaseConfig() {
  return { url: url.replace(/\/$/, ''), key, isConfigured: Boolean(url && key) };
}

function getClient() {
  if (!url || !key) throw new Error('Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  if (!client) {
    client = createClient(url, key, {
      auth: {
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  }
  return client;
}

export async function getSupabaseHeaders(extraHeaders = {}) {
  const { data: { session } } = await getClient().auth.getSession();
  return {
    apikey: key,
    Authorization: `Bearer ${session?.access_token || key}`,
    ...extraHeaders
  };
}

export async function hasAdminAccess() {
  try {
    const { data: { session } } = await getClient().auth.getSession();
    if (!session) return false;

    const { data: userData, error: userError } = await getClient().auth.getUser();
    if (userError || !userData.user) return false;

    const { data, error } = await getClient().rpc('is_admin');
    return !error && data === true;
  } catch {
    return false;
  }
}

export async function signInAdmin(email, password) {
  const { error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data, error: roleError } = await getClient().rpc('is_admin');
  if (roleError || data !== true) {
    await getClient().auth.signOut();
    throw new Error('Esta cuenta no tiene acceso de administrador.');
  }
}

export async function signOutAdmin() {
  if (!url || !key) return;
  await getClient().auth.signOut();
}
