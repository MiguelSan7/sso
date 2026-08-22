import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../lib/api';

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export const ALL: APIRoute = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let body = undefined;
    if (request.method === 'POST') {
      const text = await request.text();
      if (text) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/x-www-form-urlencoded')) {
          body = Object.fromEntries(new URLSearchParams(text));
        } else {
          try { body = JSON.parse(text); } catch (e) { console.error('Token body JSON parse error:', e); }
        }
      }
    }

    const auth = request.headers.get('authorization');
    const cookie = request.headers.get('cookie');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (auth) headers['Authorization'] = auth;
    if (cookie) headers['Cookie'] = cookie;

    const res = await proxyApiRequest('/token', request.method, body, headers);

    const payload = res.error ? { error: 'invalid_request', error_description: res.error } : (res.data || {});

    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...corsHeaders,
    };

    // Reenviar la cookie del refresh token de Adonis al navegador
    if (res.headers.setCookie) {
      responseHeaders['Set-Cookie'] = res.headers.setCookie;
    }

    return new Response(JSON.stringify(payload), {
      status: res.status || 500,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('Error fatal en token proxy:', err);
    return new Response(JSON.stringify({ error: 'server_error', error_description: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};