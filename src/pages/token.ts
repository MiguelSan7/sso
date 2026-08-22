import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../lib/api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const ALL: APIRoute = async ({ request }) => {
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (auth) headers['Authorization'] = auth;

    const res = await proxyApiRequest('/token', request.method, body, headers);

    const payload = res.error ? { error: 'invalid_request', error_description: res.error } : (res.data || {});

    return new Response(JSON.stringify(payload), {
      status: res.status || 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (err: any) {
    console.error('Error fatal en token proxy:', err);
    return new Response(JSON.stringify({ error: 'server_error', error_description: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
