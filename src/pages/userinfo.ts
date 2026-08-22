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

  const method = request.method;
  const headers: Record<string, string> = {};
  
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  let body;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    } else if (contentType.includes('application/json')) {
      body = await request.json();
    }
  }

  const res = await proxyApiRequest('/userinfo', method, body, headers);

  return new Response(JSON.stringify(res.data), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
};