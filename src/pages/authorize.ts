import type { APIRoute } from 'astro';
import { CLIENTES } from '../lib/sso-config';
import { proxyApiRequest } from '../lib/api';

export const GET: APIRoute = async ({ request, redirect, cookies }) => {
  const url = new URL(request.url);
  const clientId = url.searchParams.get('client_id') || '';
  const redirectUri = url.searchParams.get('redirect_uri') || '';
  const responseType = url.searchParams.get('response_type');
  const scope = url.searchParams.get('scope') || '';
  const state = url.searchParams.get('state') || '';
  const nonce = url.searchParams.get('nonce') || '';
  const codeChallenge = url.searchParams.get('code_challenge') || '';
  const codeChallengeMethod = url.searchParams.get('code_challenge_method') || '';
  const prompt = url.searchParams.get('prompt');

  if (!clientId && !redirectUri) {
    return redirect('https://mediocres-inc.online');
  }

  // 1. Validar Cliente y URI de redirección registrados
  const cliente = CLIENTES[clientId];
  if (!cliente || !cliente.activo) {
    return redirect(`/error?mensaje=${encodeURIComponent("client_id desconocido o inactivo")}&codigo=SSO-4006`);
  }

  if (!cliente.redirectUris.includes(redirectUri)) {
    return redirect(`/error?mensaje=${encodeURIComponent("redirect_uri no registrada para esta aplicación")}&codigo=SSO-4007`);
  }

  // 2. Transmitir /authorize al backend API para verificar parámetros y sesión SSO
  const backendRes = await proxyApiRequest(
    `/authorize?${url.searchParams.toString()}`,
    'GET',
    undefined,
    {
      cookie: request.headers.get('cookie') || '',
    }
  );

  // Si el backend responde con redirección (302) o error
  if (backendRes.status === 302 || backendRes.status === 301) {
    const targetLocation = backendRes.headers?.location;
    if (targetLocation) {
      if (targetLocation.startsWith('/interno/login')) {
        return redirect(targetLocation.replace('/interno/login', '/login'));
      }
      if (targetLocation.startsWith('/interno/registro')) {
        return redirect(targetLocation.replace('/interno/registro', '/registro'));
      }
      return redirect(targetLocation);
    }
  }

  // Si el backend devuelve un HTML o respuesta de login interno
  if (backendRes.ok && typeof backendRes.data === 'string') {
    // Si la respuesta del backend nos lleva a login con ticket
    const matchTicket = backendRes.data.match(/ticket=([a-zA-Z0-9_-]+)/);
    if (matchTicket) {
      return redirect(`/login?ticket=${encodeURIComponent(matchTicket[1])}`);
    }
  }

  // Si hay error OAuth 2.1
  if (!backendRes.ok) {
    const errorMsg = backendRes.data?.error_description || backendRes.data?.message || 'Petición de autorización inválida';
    const errCode = backendRes.data?.sso_code || 'SSO-2001';
    
    // Si podemos redirigir al cliente con error
    if (redirectUri && responseType === 'code') {
      const errUrl = new URL(redirectUri);
      errUrl.searchParams.set('error', 'invalid_request');
      errUrl.searchParams.set('error_description', errorMsg);
      if (state) errUrl.searchParams.set('state', state);
      return redirect(errUrl.toString());
    }

    return redirect(`/error?mensaje=${encodeURIComponent(errorMsg)}&codigo=${errCode}`);
  }

  return redirect(`/login?${url.searchParams.toString()}`);
};
