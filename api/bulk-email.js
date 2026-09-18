// Vercel Serverless: POST /api/bulk-email  { subject, html, text?, from? }
// Env required in Vercel Dashboard -> Settings -> Environment Variables:
//   SUPABASE_URL=https://afdrdgtcynnotokghvxh.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... (Project Settings -> API -> service_role, keep secret, bypasses RLS)
//   RESEND_API_KEY=re_... (resend.com -> API Keys)
//   FROM_EMAIL=onboarding@resend.dev  (or verified domain, e.g. noreply@yourdomain.com)
//   BULK_SECRET=any-random-string  (to protect this endpoint, send as header x-bulk-secret)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // simple protection — set BULK_SECRET in Vercel env, send same in header
  const secret = process.env.BULK_SECRET;
  if (secret && req.headers['x-bulk-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized, missing x-bulk-secret' });
  }

  const { subject, html, text, from } = req.body || {};
  if (!subject || (!html && !text)) return res.status(400).json({ error: 'subject and html or text required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM = from || process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!SUPABASE_URL || !SERVICE_KEY || !RESEND_KEY) {
    return res.status(500).json({ error: 'missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY' });
  }

  // 1) fetch all contacts (service_role bypasses RLS, so no read policy needed)
  const supa = await fetch(`${SUPABASE_URL}/rest/v1/joins?select=contact`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  if (!supa.ok) return res.status(500).json({ error: 'supabase fetch failed', detail: await supa.text() });
  const rows = await supa.json();
  const emails = [...new Set(rows.map(r => (r.contact||'').trim().toLowerCase()).filter(e => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(e)))];
  if (!emails.length) return res.status(404).json({ error: 'no contacts found' });

  // 2) send via Resend (fetch, no npm dep) — Resend supports `to` array or `bcc` for bulk
  // For deliverability, send as BCC batch (one API call). Resend limit: 50/batch for free, chunk if >50.
  const chunk = (a, n) => a.reduce((c,_,i) => i%n?c:(c.push(a.slice(i,i+n)),c), []);
  const chunks = chunk(emails, 50);
  let sent = 0;
  for (const batch of chunks) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: FROM, // Resend requires `to`, use BCC for bulk to hide list
        bcc: batch,
        subject,
        html: html || `<p>${text}</p>`,
        text: text || undefined
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'resend failed', detail: await r.text(), sent });
    sent += batch.length;
  }

  return res.status(200).json({ ok: true, sent, total: emails.length });
}
