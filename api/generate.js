function sanitize(str) {
  if (!str) return '';
  return str
    .replace(/\u2014/g, '--')
    .replace(/\u2013/g, '-')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\x7F]/g, ' ');
}

// Free models in priority order — if one fails, next is tried
const FREE_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
];

async function callOpenRouter(key, model, system, user) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://qualityfirst-lead-machine.vercel.app',
      'X-Title': 'QualityFirst Lead Machine',
    },
    body: JSON.stringify({
      model,
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
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from model');
  return text;
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
      error: 'No API key. Get a FREE key from openrouter.ai then set it via the SET API KEY button.'
    });
  }

  let lastError = '';
  for (const model of FREE_MODELS) {
    try {
      const text = await callOpenRouter(key, model, system, user);
      return res.status(200).json({
        content: [{ type: 'text', text }],
        model_used: model
      });
    } catch (err) {
      lastError = err.message;
      continue; // try next model
    }
  }

  return res.status(500).json({
    error: `All free models failed. Last error: ${lastError}`
  });
}
