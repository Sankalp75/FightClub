// Vercel Serverless: POST /api/bulk-email { subject, html, text? } -> sends via YOUR Gmail
// Env in Vercel Dashboard -> Settings -> Environment Variables:
//   SUPABASE_URL=https://afdrdgtcynnotokghvxh.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... (Supabase -> Project Settings -> API -> service_role, bypasses RLS)
//   GMAIL_USER=you@gmail.com (the address mails appear FROM)
//   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop (Google Account -> Security -> 2FA -> App passwords -> Mail -> 16 chars, spaces ok)
//   BULK_SECRET=any-random-string (protect endpoint, send as header x-bulk-secret)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = process.env.BULK_SECRET;
  if (secret && req.headers['x-bulk-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized, missing x-bulk-secret' });
  }

  const { subject, html, text } = req.body || {};
  if (!subject || (!html && !text)) return res.status(400).json({ error: 'subject and html or text required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

  if (!SUPABASE_URL || !SERVICE_KEY || !GMAIL_USER || !GMAIL_PASS) {
    return res.status(500).json({ error: 'missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / GMAIL_USER / GMAIL_APP_PASSWORD' });
  }

  // 1) fetch contacts (service_role bypasses RLS)
  const supa = await fetch(`${SUPABASE_URL}/rest/v1/joins?select=contact`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  if (!supa.ok) return res.status(500).json({ error: 'supabase fetch failed', detail: await supa.text() });
  const rows = await supa.json();
  const emails = [...new Set(rows.map(r => (r.contact||'').trim().toLowerCase()).filter(e => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(e)))];
  if (!emails.length) return res.status(404).json({ error: 'no contacts found' });

  // 2) Gmail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS.replace(/\s/g,'') }
  });

  // Gmail BCC limit: keep 50 / batch, 500/day personal, 2000/day Workspace
  const chunk = (a,n) => a.reduce((c,_,i)=> i%n?c:(c.push(a.slice(i,i+n)),c), []);
  const chunks = chunk(emails, 50);
  let sent = 0;
  for (const batch of chunks) {
    try {
      await transporter.sendMail({
        from: GMAIL_USER,
        to: GMAIL_USER, // to self, hide list in bcc
        bcc: batch,
        subject,
        html: html || `<p>${text}</p>`,
        text: text || html?.replace(/<[^>]+>/g,'') || undefined
      });
      sent += batch.length;
    } catch (e) {
      return res.status(502).json({ error: 'gmail send failed', detail: e.message, sent });
    }
  }

  return res.status(200).json({ ok: true, sent, total: emails.length, from: GMAIL_USER });
}
