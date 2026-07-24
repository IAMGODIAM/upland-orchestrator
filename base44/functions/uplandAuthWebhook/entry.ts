import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const categoryFor = (type) => type.startsWith('Authentication') || type === 'UserDisconnectedApplication' ? 'authentication' : type.includes('Escrow') || type.startsWith('Container') ? 'escrow' : type.startsWith('RumbleTournament') ? 'tournament' : 'unknown';
const settlementFor = (type) => type.endsWith('Final') ? 'final' : /Failure|Expired|Rejected|Canceled/.test(type) ? 'failed' : /Created|Signed/.test(type) ? 'pending' : 'informational';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req), event = await req.json();
    const type = String(event.type || ''), data = event.data || {};
    if (!type) return Response.json({ error: 'Missing event type' }, { status: 400 });
    const transactionId = String(data.transactionId || '');
    if (transactionId) {
      const duplicate = await base44.asServiceRole.entities.UplandWebhookEvent.filter({ event_type: type, transaction_id: transactionId }, '-received_at', 1);
      if (duplicate[0]) return Response.json({ received: true, duplicate: true });
    }
    if (type === 'AuthenticationSuccess') {
      const code = String(data.code || ''), accessToken = String(data.accessToken || ''), userId = String(data.userId || '');
      if (!code || !accessToken || !userId) return Response.json({ error: 'Invalid authentication event' }, { status: 400 });
      const pending = await base44.asServiceRole.entities.UplandConnection.filter({ connection_code: code, status: 'pending' }, '-updated_date', 1);
      if (!pending[0]) return Response.json({ error: 'Unknown or completed connection code' }, { status: 404 });
      const profileResponse = await fetch('https://api.prod.upland.me/developers-api/user/profile', { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
      if (!profileResponse.ok) return Response.json({ error: 'Upland access token verification failed' }, { status: 401 });
      const profile = await profileResponse.json(), profileId = String(profile.id || profile.userId || profile.data?.id || profile.data?.userId || '');
      if (profileId && profileId !== userId) return Response.json({ error: 'Upland user identity did not match' }, { status: 401 });
      await base44.asServiceRole.entities.UplandConnection.update(pending[0].id, { status: 'connected', upland_user_id: userId, access_token: accessToken, profile, connected_at: new Date().toISOString() });
    } else if (type === 'AuthenticationFailure') {
      const pending = await base44.asServiceRole.entities.UplandConnection.filter({ connection_code: String(data.code || ''), status: 'pending' }, '-updated_date', 1);
      if (pending[0]) await base44.asServiceRole.entities.UplandConnection.update(pending[0].id, { status: 'expired' });
    } else if (type === 'UserDisconnectedApplication') {
      const connected = await base44.asServiceRole.entities.UplandConnection.filter({ upland_user_id: String(data.userId || ''), status: 'connected' }, '-updated_date', 1);
      if (connected[0]) await base44.asServiceRole.entities.UplandConnection.update(connected[0].id, { status: 'expired', access_token: '' });
    }
    const safeData = { ...data };
    delete safeData.accessToken;
    await base44.asServiceRole.entities.UplandWebhookEvent.create({ event_type: type, category: categoryFor(type), settlement_state: settlementFor(type), transaction_id: transactionId, container_id: String(data.containerId || ''), upland_user_id: String(data.userId || ''), data: safeData, received_at: new Date().toISOString() });
    return Response.json({ received: true, settlement_state: settlementFor(type) });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
});