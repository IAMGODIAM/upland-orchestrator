import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const records = await base44.asServiceRole.entities.UplandConnection.filter({ base44_user_id: user.id }, '-updated_date', 1);
    const record = records[0];
    if (!record) return Response.json({ status: 'not_connected' });
    return Response.json({ status: record.status, code: record.status === 'pending' ? record.connection_code : null, upland_user_id: record.upland_user_id || null, profile: record.profile || null, connected_at: record.connected_at || null });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
});