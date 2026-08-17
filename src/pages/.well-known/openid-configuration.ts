import type { APIRoute } from 'astro';
import { proxyApiRequest } from '../../lib/api';

export const GET: APIRoute = async () => {
  const res = await proxyApiRequest('/.well-known/openid-configuration');
  if (res.ok && typeof res.data === 'object') {
    return new Response(JSON.stringify(res.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // Fallback si la API aún no está arriba
  const issuer = process.env.SSO_ISSUER || 'http://localhost:4321';
  return new Response(
    JSON.stringify({
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      userinfo_endpoint: `${issuer}/userinfo`,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      end_session_endpoint: `${issuer}/logout`,
      revocation_endpoint: `${issuer}/token/revoke`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      id_token_signing_alg_values_supported: ['RS256', 'ES256'],
      scopes_supported: ['openid', 'perfil', 'sgeb.api'],
      token_endpoint_auth_methods_supported: ['none'],
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
};
