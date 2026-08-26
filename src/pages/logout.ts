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
  if (res.headers.setCookie) {
    responseHeaders.set('Set-Cookie', res.headers.setCookie);
  }

  // 1. Si el backend emitió una redirección (ej. post_logout_redirect_uri válida)
  if (res.headers.location) {
    responseHeaders.set('Location', res.headers.location);
    return new Response(null, {
      status: 302,
      headers: responseHeaders,
    });
  }

  // 2. Si vino un post_logout_redirect_uri en la query
  const postLogoutRedirect = url.searchParams.get('post_logout_redirect_uri');
  if (postLogoutRedirect) {
    responseHeaders.set('Location', postLogoutRedirect);
    return new Response(null, {
      status: 302,
      headers: responseHeaders,
    });
  }

  // 3. Si el backend respondió con HTML de pantalla de sesión cerrada
  if (res.ok && typeof res.data === 'string') {
    responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(res.data, {
      status: 200,
      headers: responseHeaders,
    });
  }

  // 4. Por defecto, mandar a la landing page
  responseHeaders.set('Location', 'https://mediocres-inc.online');
  return new Response(null, {
    status: 302,
    headers: responseHeaders,
  });
};
