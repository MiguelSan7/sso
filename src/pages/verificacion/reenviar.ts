import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../../lib/api';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const ticket = url.searchParams.get('ticket') || '';

  if (!ticket) {
    return redirect('https://mediocres-inc.online');
  }

  try {
    await proxyApiRequest(
      `/interno/verificacion/reenviar?ticket=${encodeURIComponent(ticket)}`,
      'GET',
      undefined,
      {
        cookie: request.headers.get('cookie') || '',
      }
    );

    return redirect(`/verificacion?ticket=${encodeURIComponent(ticket)}&reenviado=1`);
  } catch (error) {
    console.error('Error al reenviar código:', error);
    return redirect(`/verificacion?ticket=${encodeURIComponent(ticket)}&error=No+se+pudo+reenviar+el+codigo`);
  }
};
