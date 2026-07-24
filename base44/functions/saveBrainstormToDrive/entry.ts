import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { title, messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'There is no brainstorm to save.' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const headers = { Authorization: `Bearer ${accessToken}` };
    const escapeQuery = (value) => String(value).replace(/'/g, "\\'");
    const ensureFolder = async (name, parentId) => {
      const parentClause = parentId ? ` and '${escapeQuery(parentId)}' in parents` : '';
      const params = new URLSearchParams({
        q: `name = '${escapeQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentClause}`,
        spaces: 'drive', fields: 'files(id,name)', pageSize: '1'
      });
      const found = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers });
      if (!found.ok) throw new Error('Could not check the Google Drive folders.');
      const existing = await found.json();
      if (existing.files?.[0]) return existing.files[0].id;
      const created = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', ...(parentId && { parents: [parentId] }) })
      });
      if (!created.ok) throw new Error('Could not create the Google Drive folders.');
      return (await created.json()).id;
    };

    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = `${String(now.getUTCMonth() + 1).padStart(2, '0')}-${now.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })}`;
    const rootId = await ensureFolder('Upland DevCore Brainstorms');
    const yearId = await ensureFolder(year, rootId);
    const monthId = await ensureFolder(month, yearId);
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
    const cleanTitle = String(title || 'Upland Brainstorm').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Upland Brainstorm';
    const transcript = messages.map((message) => `<article class="message ${message.role === 'user' ? 'user' : 'operator'}"><div class="role">${message.role === 'user' ? 'You' : 'Upland Operator'}</div><div class="content">${escapeHtml(message.content)}</div></article>`).join('\n');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(cleanTitle)}</title><style>body{margin:0;background:#0b1120;color:#e5e7eb;font:16px/1.6 system-ui,sans-serif}.page{max-width:860px;margin:auto;padding:48px 24px}h1{line-height:1.2}.meta,.role{color:#94a3b8}.message{margin:18px 0;padding:18px 20px;border:1px solid #334155;border-radius:12px;background:#111827}.message.user{border-color:#6366f1}.role{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.content{margin-top:8px;white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body><main class="page"><h1>${escapeHtml(cleanTitle)}</h1><p class="meta">Saved from Upland DevCore on ${escapeHtml(now.toUTCString())}</p>${transcript}</main></body></html>`;
    const safeName = cleanTitle.replace(/[\\/:*?"<>|]/g, '').slice(0, 60);
    const fileName = `${now.toISOString().slice(0, 10)} - ${safeName}.html`;
    const boundary = `upland-${crypto.randomUUID()}`;
    const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: fileName, parents: [monthId] })}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n--${boundary}--`;
    const uploaded = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST', headers: { ...headers, 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart
    });
    if (!uploaded.ok) throw new Error('Google Drive could not save the brainstorm.');
    const file = await uploaded.json();
    return Response.json({ ...file, folderPath: `Upland DevCore Brainstorms/${year}/${month}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});