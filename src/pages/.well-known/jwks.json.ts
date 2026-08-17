import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../../lib/api';

export const GET: APIRoute = async () => {
  const res = await proxyApiRequest('/.well-known/jwks.json');
  if (res.ok && typeof res.data === 'object') {
    return new Response(JSON.stringify(res.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return new Response(
    JSON.stringify({ keys: [] }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
