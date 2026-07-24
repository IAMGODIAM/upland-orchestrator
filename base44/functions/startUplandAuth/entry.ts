import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const appId = Deno.env.get('UPLAND_APP_ID');
    const appSecret = Deno.env.get('UPLAND_ACCESS_TOKEN');
    if (!appId || !appSecret) throw new Error('Upland credentials are not configured');
    const response = await fetch('https://api.prod.upland.me/developers-api/auth/otp/init', {
      method: 'POST', headers: { Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}`, Accept: 'application/json' }
    });
    const payload = await response.json();
    if (!response.ok) return Response.json({ error: payload.message || 'Upland could not create a connection code' }, { status: response.status });
    const code = payload.code || payload.data?.code;
    if (!code) throw new Error('Upland did not return a connection code');
    const existing = await base44.asServiceRole.entities.UplandConnection.filter({ base44_user_id: user.id }, '-updated_date', 1);
    const values = { base44_user_id: user.id, connection_code: code, status: 'pending', upland_user_id: '', access_token: '', profile: {} };
    if (existing[0]) await base44.asServiceRole.entities.UplandConnection.update(existing[0].id, values);
    else await base44.asServiceRole.entities.UplandConnection.create(values);
    return Response.json({ code, status: 'pending' });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
});