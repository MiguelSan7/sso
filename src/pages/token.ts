import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../lib/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    let body;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    } else {
      body = await request.json();
    }

    const res = await proxyApiRequest('/token', 'POST', body, {
      'Content-Type': 'application/json'
    });

    return new Response(JSON.stringify(res.data), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'server_error', error_description: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
