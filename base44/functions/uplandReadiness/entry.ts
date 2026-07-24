import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const appId = Deno.env.get('UPLAND_APP_ID'), appSecret = Deno.env.get('UPLAND_ACCESS_TOKEN');
    const credentialsReady = Boolean(appId && appSecret);
    const connections = await base44.asServiceRole.entities.UplandConnection.filter({ base44_user_id: user.id }, '-updated_date', 1);
    const events = await base44.asServiceRole.entities.UplandWebhookEvent.list('-received_at', 10);
    const productionWebhookUrl = 'https://upland-devcore.yisraelleemccartney.workers.dev/webhooks/upland/d080a57e9302d0be3f59bfcd?profile=prod';
    const webhookEndpointResponse = await fetch(productionWebhookUrl);
    const webhookEndpointReachable = webhookEndpointResponse.ok;
    let devShops = [], devShopReachable = false;
    if (credentialsReady) {
      const response = await fetch('https://api.prod.upland.me/developers-api/devshops', { headers: { Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}`, Accept: 'application/json' } });
      devShopReachable = response.ok;
      if (response.ok) {
        const payload = await response.json();
        devShops = Array.isArray(payload) ? payload : payload.devShops || payload.devshops || payload.data || [];
      }
    }
    const playerConnected = connections[0]?.status === 'connected';
    const webhookVerified = events.length > 0;
    const checks = [
      { id: 'credentials', label: 'Production credentials', detail: credentialsReady ? 'App credentials are available in the secure vault.' : 'Production App ID and secret are required.', status: credentialsReady ? 'ready' : 'blocked' },
      { id: 'player', label: 'Developer player account', detail: playerConnected ? 'Your Upland identity is connected.' : 'Connect the account that owns the Dev Shop property.', status: playerConnected ? 'ready' : 'blocked' },
      { id: 'webhook', label: 'Webhook delivery', detail: webhookVerified ? 'Production events are reaching DevCore.' : webhookEndpointReachable ? 'The verified production endpoint is reachable, but no Upland event has reached this app yet.' : 'The production webhook endpoint is not reachable.', status: webhookVerified ? 'ready' : 'blocked' },
      { id: 'devshop', label: 'Dev Shop registration', detail: devShops.length ? `${devShops.length} production address${devShops.length === 1 ? '' : 'es'} registered.` : 'No production Dev Shop is registered.', status: devShops.length ? 'ready' : 'blocked' },
      { id: 'finality', label: 'Blockchain finality guard', detail: 'Signed and Created events remain pending; only Final events are settled.', status: 'ready' }
    ];
    return Response.json({ production_ready: checks.every((item) => item.status === 'ready'), checks, dev_shop_api_reachable: devShopReachable, production_webhook_url: productionWebhookUrl, webhook_endpoint_reachable: webhookEndpointReachable, supported_webhook_types: 18, recent_events: events.map((event) => ({ id: event.id, event_type: event.event_type, category: event.category, settlement_state: event.settlement_state, received_at: event.received_at })) });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
});