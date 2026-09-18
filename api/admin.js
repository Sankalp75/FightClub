import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
  try {
    // try root admin.html first, then public/admin.html
    let html;
    try {
      html = await readFile(join(process.cwd(), 'admin.html'), 'utf8');
    } catch {
      html = await readFile(join(process.cwd(), 'public', 'admin.html'), 'utf8');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(404).send('admin not found');
  }
}
