import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const listFrom = (value, keys) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
};

const numberFrom = (value, keys) => {
  for (const key of keys) {
    const found = value?.[key];
    if (typeof found === 'number') return found;
    if (typeof found === 'string' && found.trim() && !Number.isNaN(Number(found))) return Number(found);
  }
  return 0;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await base44.asServiceRole.entities.UplandConnection.filter({ base44_user_id: user.id, status: 'connected' }, '-updated_date', 1);
    const connection = rows[0];
    if (!connection?.access_token) return Response.json({ error: 'Finish connecting your Upland account to unlock Today.' }, { status: 409 });

    const baseUrl = 'https://api.prod.upland.me/developers-api';
    const headers = { Authorization: `Bearer ${connection.access_token}`, Accept: 'application/json' };
    const paths = ['/user/profile', '/user/balances', '/user/assets/properties', '/user/assets/nfts', '/user/travels'];
    const responses = await Promise.all(paths.map((path) => fetch(`${baseUrl}${path}`, { headers })));
    const payloads = await Promise.all(responses.map(async (response) => {
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
      return { ok: response.ok, status: response.status, data };
    }));
    const failed = payloads.find((payload) => !payload.ok);
    if (failed) return Response.json({ error: failed.data?.message || failed.data?.error || 'Upland could not load the portfolio.', status: failed.status }, { status: 502 });

    const [profileResult, balanceResult, propertyResult, nftResult, travelResult] = payloads;
    const properties = listFrom(propertyResult.data, ['properties', 'data', 'items', 'results']);
    const nfts = listFrom(nftResult.data, ['nfts', 'assets', 'data', 'items', 'results']);
    const travels = listFrom(travelResult.data, ['travels', 'data', 'items', 'results']);
    const balanceSource = balanceResult.data?.balances || balanceResult.data;
    const upx = numberFrom(balanceSource, ['upx', 'UPX', 'upx_balance', 'balance']);
    const sparklet = numberFrom(balanceSource, ['sparklet', 'SPARKLET', 'spark', 'SPARK', 'spark_balance']);
    const actions = [];
    if (!properties.length) actions.push({ priority: 'high', title: 'Establish your first foothold', reason: 'No properties were returned for this connected account.', impact: 'Unlock collections, construction, and marketplace activity.', destination: 'World Data' });
    else actions.push({ priority: 'high', title: 'Review collection fit', reason: `${properties.length} properties are available for a collection and yield review.`, impact: 'Find underused holdings before making another purchase.', destination: 'World Data' });
    if (nfts.length) actions.push({ priority: 'medium', title: 'Put owned assets to work', reason: `${nfts.length} NFTs are visible in your inventory.`, impact: 'Identify assets that can support shops, racing, or connected experiences.', destination: 'Explorer' });
    if (upx > 0) actions.push({ priority: 'medium', title: 'Protect deployable liquidity', reason: `${Math.round(upx).toLocaleString('en-US')} UPX is currently visible.`, impact: 'Set a reserve before evaluating listings or construction.', destination: 'World Data' });
    if (!nfts.length && actions.length < 3) actions.push({ priority: 'low', title: 'Scan the experience layer', reason: 'No connected NFTs were returned in this snapshot.', impact: 'Discover which asset class best supports your preferred playstyle.', destination: 'Explorer' });

    return Response.json({
      generated_at: new Date().toISOString(),
      profile: profileResult.data || connection.profile || {},
      summary: { properties: properties.length, nfts: nfts.length, travels: travels.length, upx, sparklet },
      actions: actions.slice(0, 3)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});