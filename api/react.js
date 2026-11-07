// Vercel serverless function: /api/react
const TO = process.env.REACT_EMAIL || 'raysonbayan15@gmail.com';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'POST only' });
    return;
  }

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};

  const kind = b.kind === 'heart' ? 'heart' : 'haha';
  const emoji = kind === 'heart' ? '❤️' : '😂';
  const label = kind === 'heart' ? 'Heart' : 'Haha';
  const origin = req.headers.origin || ('https://' + (req.headers.host || ''));
  const referer = req.headers.referer || origin + '/';

  try {
    const r = await fetch('https://formsubmit.co/ajax/' + TO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': origin,
        'Referer': referer,
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      },
      body: JSON.stringify({
        _subject: emoji + ' Someone reacted to your portfolio website!',
        _template: 'table',
        _captcha: 'false',
        _honey: '',
        Reaction: emoji + ' ' + label,
        Message: 'Someone reacted ' + emoji + ' (' + label + ') to your portfolio website.',
        Time: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
        Page: String(b.page || '').slice(0, 300)
      })
    });
    const text = await r.text();
    let d = {};
    try { d = JSON.parse(text); } catch (e) {}
    const ok = r.ok && (d.success === true || d.success === 'true');
    res.status(ok ? 200 : 502).json({
      success: ok,
      message: d.message || text.slice(0, 200),
      upstream: r.status
    });
  } catch (e) {
    res.status(502).json({ success: false, message: 'server error: ' + String(e) });
  }
};
