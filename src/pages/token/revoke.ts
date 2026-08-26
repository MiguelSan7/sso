import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../../lib/api';

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
          try { body = JSON.parse(text); } catch (e) {}
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

    const res = await proxyApiRequest('/token/revoke', request.method, body, headers);

    return new Response(null, {
      status: res.status || 200,
      headers: corsHeaders,
    });
  } catch {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
};
