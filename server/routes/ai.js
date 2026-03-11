const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory session history (use Redis in production)
const sessionHistories = {};

const SCENARIO_PROMPTS = {
  hawker: `You are a friendly hawker stall owner in Singapore. The user is an AAC (Augmentative and Alternative Communication) device user practising ordering food. Keep responses short (1-2 sentences), use simple vocabulary, and be patient and encouraging. Ask simple follow-up questions like "What would you like to order?" or "Would you like rice or noodles?"`,
  shop: `You are a helpful supermarket staff member in Singapore. The user is an AAC device user practising grocery shopping. Be patient, use simple clear language, and help them find items or assist with their shopping.`,
  transport: `You are a friendly bus driver or MRT staff member in Singapore. The user is an AAC device user practising navigating public transport. Help them with directions, tickets, and journey planning using simple language.`,
  clinic: `You are a kind clinic receptionist or nurse in Singapore. The user is an AAC device user practising a clinic visit. Help them check in, describe symptoms, and understand instructions using simple, clear language.`,
};

/**
 * POST /ai/respond
 * Body: { sessionId, scenarioId, message, userLevel }
 * Returns: { response }
 */
router.post('/respond', async (req, res) => {
  try {
    const { sessionId, scenarioId = 'hawker', message, userLevel = 'beginner' } = req.body;

    if (!sessionHistories[sessionId]) sessionHistories[sessionId] = [];

    const history = sessionHistories[sessionId];
    history.push({ role: 'user', content: message });

    const systemPrompt = SCENARIO_PROMPTS[scenarioId] || SCENARIO_PROMPTS.hawker;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: systemPrompt,
      messages: history.slice(-10), // Keep last 10 turns for context
    });

    const aiText = response.content[0].text;
    history.push({ role: 'assistant', content: aiText });

    res.json({ response: aiText });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'AI response failed' });
  }
});

/**
 * DELETE /ai/session/:sessionId
 * Clear session history
 */
router.delete('/session/:sessionId', (req, res) => {
  delete sessionHistories[req.params.sessionId];
  res.json({ success: true });
});

module.exports = router;
