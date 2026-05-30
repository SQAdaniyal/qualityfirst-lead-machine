// Sanitize unicode characters that break ByteString encoding
function sanitize(str) {
  if (!str) return '';
  return str
    .replace(/\u2014/g, '--')       // em dash
    .replace(/\u2013/g, '-')        // en dash
    .replace(/\u2018|\u2019/g, "'") // curly single quotes
    .replace(/\u201C|\u201D/g, '"') // curly double quotes
    .replace(/\u2026/g, '...')      // ellipsis
    .replace(/\u00D7/g, 'x')        // multiplication sign
    .replace(/[^\x00-\x7F]/g, ' '); // any remaining non-ASCII
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, user, apiKey } = req.body;
  const key = process.env.OPENROUTER_API_KEY || apiKey;

  if (!key) {
    return res.status(400).json({
      error: 'No API key. Get a FREE key from openrouter.ai then set OPENROUTER_API_KEY in Vercel env vars.'
    });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://qualityfirst-lead-machine.vercel.app',
        'X-Title': 'QualityFirst Lead Machine',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: sanitize(system) },
          { role: 'user',   content: sanitize(user)   }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
