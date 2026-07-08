export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('Telegram credentials not configured, skipping notification');
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    // Get visitor IP from headers
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';

    // Get approximate location from IP (city-level at best, unreliable for mobile/VPN)
    let location = 'Unknown location';
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.status === 'success') {
          location = [geo.city, geo.regionName, geo.country].filter(Boolean).join(', ');
        }
      }
    } catch (geoErr) {
      console.log('Geolocation lookup failed:', geoErr.message);
    }

    const timestamp = new Date().toISOString();
    const message = `👀 New visit to Deep Value Alpha\nTime: ${timestamp}\nLocation: ${location} (approx.)`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (!telegramRes.ok) {
      const err = await telegramRes.text();
      console.error('Telegram API error:', err);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notification error:', err);
    return res.status(200).json({ ok: true, error: 'Internal error, notification skipped' });
  }
}
