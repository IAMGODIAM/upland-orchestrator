import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const event = await req.json();
    if (event.type !== 'AuthenticationSuccess') return Response.json({ received: true });
    const code = String(event.data?.code || ''), accessToken = String(event.data?.accessToken || ''), userId = String(event.data?.userId || '');
    if (!code || !accessToken || !userId) return Response.json({ error: 'Invalid authentication event' }, { status: 400 });
    const pending = await base44.asServiceRole.entities.UplandConnection.filter({ connection_code: code, status: 'pending' }, '-updated_date', 1);
    if (!pending[0]) return Response.json({ error: 'Unknown or completed connection code' }, { status: 404 });
    const profileResponse = await fetch('https://api.prod.upland.me/developers-api/user/profile', { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
    if (!profileResponse.ok) return Response.json({ error: 'Upland access token verification failed' }, { status: 401 });
    const profile = await profileResponse.json();
    const profileId = String(profile.id || profile.userId || profile.data?.id || profile.data?.userId || '');
    if (profileId && profileId !== userId) return Response.json({ error: 'Upland user identity did not match' }, { status: 401 });
    await base44.asServiceRole.entities.UplandConnection.update(pending[0].id, { status: 'connected', upland_user_id: userId, access_token: accessToken, profile, connected_at: new Date().toISOString() });
    return Response.json({ connected: true });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
});