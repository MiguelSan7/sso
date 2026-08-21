/**
 * Configuración y tipos del Proveedor SSO Gobernado
 */

export interface ClienteRegistrado {
  clientId: string;
  nombre: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  scopes: string[];
  tipo: 'web' | 'movil';
  activo: boolean;
}

export const CLIENTES: Record<string, ClienteRegistrado> = {
  'sgeb-web-panel': {
    clientId: 'sgeb-web-panel',
    nombre: 'Panel del Capitán y Administración',
    redirectUris: ['https://mediocres-inc.online/auth/callback', 'https://sgeb.mediocres.mx/auth/callback', 'http://localhost:5173/auth/callback'],
    postLogoutRedirectUris: ['https://mediocres-inc.online/', 'https://sgeb.mediocres.mx/', 'http://localhost:5173/'],
    scopes: ['openid', 'profile', 'perfil', 'sgeb.api'],
    tipo: 'web',
    activo: true,
  },
  'sgeb-ios-mesero': {
    clientId: 'sgeb-ios-mesero',
    nombre: 'App iOS del Mesero',
    redirectUris: ['mx.mediocres.sgeb://callback'],
    postLogoutRedirectUris: ['mx.mediocres.sgeb://logout'],
    scopes: ['openid', 'profile', 'perfil', 'sgeb.api'],
    tipo: 'movil',
    activo: true,
  },
};

export const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3333';
