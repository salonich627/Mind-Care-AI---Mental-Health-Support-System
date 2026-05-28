require('dotenv').config();

const express = require('express');
const https = require('https');
const path = require('path');
const open = constopen = (...args) => import('open').then(module => module.default(...args));

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// HOME ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// CHAT API
app.post('/api/chat', (req, res) => {

  const messages = req.body.messages || [];
  const mood = req.body.mood || 'emotional';

  const systemPrompt = `
You are MindCare AI, a warm and caring mental health assistant.

Rules:
- Speak naturally like a real supportive friend
- Keep replies short and comforting
- Give useful emotional advice
- Suggest calming activities sometimes
- Use soft emojis occasionally
- Never sound robotic
- Be emotionally intelligent
- Always respond helpfully
- Avoid repeating the same sentence
- Make every reply unique

Current user mood: ${mood}
`;

  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ],
    temperature: 0.9,
    max_tokens: 300
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const apiReq = https.request(options, (apiRes) => {

    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {

      try {

        const parsed = JSON.parse(data);

        console.log(parsed);

        const reply =
          parsed?.choices?.[0]?.message?.content ||
          "I'm here for you 💙";

        res.json({ reply });

      } catch (err) {

        console.log(err);

        res.status(500).json({
          reply: 'Connection issue  Please try again.'
        });
      }
    });
  });

  apiReq.on('error', (err) => {

    console.log(err);

    res.status(500).json({
      reply: 'Server error '
    });
  });

  apiReq.write(body);
  apiReq.end();

});

const PORT = 3000;

app.listen(PORT, async () => {

  console.log(` Server running on http://localhost:${PORT}`);

  await open(`http://localhost:${PORT}`);
});