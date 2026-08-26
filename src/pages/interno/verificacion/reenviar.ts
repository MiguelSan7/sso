import type { APIRoute } from 'astro';
import { GET as handler } from '../../verificacion/reenviar';

export const GET: APIRoute = handler;
