import { BACKEND_API_URL } from './sso-config';

export async function proxyApiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, any>,
  headers?: Record<string, string>
) {
  try {
    const isForm = body && !(headers?.['Content-Type']?.includes('application/json'));
    let formattedBody: any = undefined;

    if (body) {
      if (headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
        const params = new URLSearchParams();
        Object.entries(body).forEach(([k, v]) => params.append(k, String(v)));
        formattedBody = params.toString();
      } else {
        formattedBody = JSON.stringify(body);
      }
    }

    const res = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/html',
        ...headers,
      },
      body: formattedBody,
      redirect: 'manual', // Capturar 302/301 explícitos de AdonisJS
    });
    
    const contentType = res.headers.get('content-type') || '';
    const setCookie = res.headers.get('set-cookie');
    const location = res.headers.get('location');

    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      status: res.status,
      ok: res.ok || res.status === 302 || res.status === 301,
      data,
      headers: {
        setCookie,
        location,
      },
    };
  } catch (error: any) {
    return {
      status: 500,
      ok: false,
      error: error.message || 'Error de conexión con el backend de identidad',
      headers: {},
    };
  }
}
