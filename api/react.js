// Vercel serverless function: /api/react  (sends via Resend)
const TO = process.env.REACT_EMAIL || 'raysonbayan15@gmail.com';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'POST only' });
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ success: false, message: 'Missing RESEND_API_KEY env var' });
    return;
  }

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};

  const kind = b.kind === 'heart' ? 'heart' : 'haha';
  const emoji = kind === 'heart' ? '❤️' : '😂';
  const label = kind === 'heart' ? 'Heart' : 'Haha';
  const time = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
  const page = String(b.page || '').slice(0, 300).replace(/[<>&]/g, '');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Portfolio Reactions <onboarding@resend.dev>',
        to: [TO],
        subject: emoji + ' Someone reacted to your portfolio website!',
        html: '<p>Someone reacted <b>' + emoji + ' ' + label + '</b> to your portfolio website.</p>' +
              '<p>Time: ' + time + '<br>Page: ' + page + '</p>'
      })
    });
    const d = await r.json().catch(() => ({}));
    const ok = r.ok && !!d.id;
    res.status(ok ? 200 : 502).json({
      success: ok,
      message: d.message || (ok ? 'sent' : 'send failed'),
      upstream: r.status
    });
  } catch (e) {
    res.status(502).json({ success: false, message: 'server error: ' + String(e) });
  }
};
