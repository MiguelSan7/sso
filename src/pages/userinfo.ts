import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../lib/api';

export const ALL: APIRoute = async ({ request }) => {
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
    headers: { 'Content-Type': 'application/json' },
  });
};
