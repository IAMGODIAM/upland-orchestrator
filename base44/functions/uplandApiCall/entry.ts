import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  const started = Date.now();
  try {
    const baseUrl = 'https://api.prod.upland.me/developers-api';
    const mutations = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const input = await req.json();
    const method = String(input.method || 'GET').toUpperCase();
    const endpoint = String(input.endpoint || '');
    if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return Response.json({ error: 'Unsupported method' }, { status: 400 });
    if (!endpoint.startsWith('/') || endpoint.includes('://') || endpoint.includes('..')) return Response.json({ error: 'Invalid Upland endpoint' }, { status: 400 });

    const controls = await base44.asServiceRole.entities.AgentControl.list('-created_date', 1);
    const godMode = controls[0]?.god_mode === true;
    if (mutations.has(method) && input.source === 'agent' && !godMode && input.confirmed !== true) {
      return Response.json({ confirmation_required: true, method, endpoint, message: 'Explicit approval is required before this action.' }, { status: 409 });
    }

    const query = new URLSearchParams();
    Object.entries(input.query || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
      else if (value !== null && value !== undefined && value !== '') query.set(key, String(value));
    });
    const url = `${baseUrl}${endpoint}${query.size ? `?${query}` : ''}`;
    const appId = Deno.env.get('UPLAND_APP_ID');
    const accessToken = Deno.env.get('UPLAND_ACCESS_TOKEN');
    if (!appId || !accessToken) throw new Error('Upland credentials are not configured');
    const authorization = input.authMode === 'bearer'
      ? `Bearer ${String(input.userAccessToken || '')}`
      : `Basic ${btoa(`${appId}:${accessToken}`)}`;
    if (input.authMode === 'bearer' && !input.userAccessToken) return Response.json({ error: 'A Upland user access token is required for this endpoint' }, { status: 400 });

    const uplandResponse = await fetch(url, {
      method,
      headers: { Authorization: authorization, Accept: 'application/json', ...(input.body ? { 'Content-Type': 'application/json' } : {}) },
      body: input.body && method !== 'GET' ? JSON.stringify(input.body) : undefined
    });
    const text = await uplandResponse.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    const latency = Date.now() - started;
    await base44.asServiceRole.entities.ApiLog.create({
      endpoint, method, category: input.category || 'Uncategorized', status_code: uplandResponse.status,
      latency_ms: latency, success: uplandResponse.ok, request_payload: { query: input.query || {}, body: input.body || null },
      response_payload: { preview: JSON.stringify(data).slice(0, 3500) }, source: input.source || 'backend'
    });
    return Response.json({ success: uplandResponse.ok, status: uplandResponse.status, latency_ms: latency, data }, { status: uplandResponse.ok ? 200 : uplandResponse.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});