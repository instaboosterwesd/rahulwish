import { portableTemplateCover } from '@/lib/template-cover';

export async function resolveTemplateCover(cover: string, category: string) {
  if (!cover.startsWith('storage:template-covers/')) return portableTemplateCover(cover, category);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const path = cover.slice('storage:template-covers/'.length);
  const { data, error } = await supabaseAdmin.storage.from('template-covers').createSignedUrl(path, 3600);
  if (error || !data) return portableTemplateCover('', category);
  const publicOrigin = process.env['VITE_SUPABASE_URL'];
  const url = new URL(data.signedUrl);
  return publicOrigin ? new URL(url.pathname + url.search, publicOrigin).href : data.signedUrl;
}