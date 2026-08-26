import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../lib/api';

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const endpoint = query ? `/logout?${query}` : '/logout';

  const res = await proxyApiRequest(
    endpoint,
    request.method,
    undefined,
    {
      cookie: request.headers.get('cookie') || '',
    }
  );

  const responseHeaders = new Headers();

  // Limpiar explícitamente todas las cookies de sesión en el dominio del SSO
  responseHeaders.append('Set-Cookie', 'sso_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax');
  responseHeaders.append('Set-Cookie', 'sgeb_refresh=; Path=/token; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax');
  responseHeaders.append('Set-Cookie', 'sgeb_dispositivo=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax');

  if (res.headers.setCookie) {
    responseHeaders.append('Set-Cookie', res.headers.setCookie);
  }

  // 1. Si el backend emitió Location o vino post_logout_redirect_uri
  const targetLocation = res.headers.location || url.searchParams.get('post_logout_redirect_uri') || 'https://mediocres-inc.online/';
  
  responseHeaders.set('Location', targetLocation);
  return new Response(null, {
    status: 302,
    headers: responseHeaders,
  });
};
