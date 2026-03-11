const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory store; replace with PostgreSQL + Redis in production
const sessions = {};

router.post('/create', (req, res) => {
  const { scenarioId, hostId, mode } = req.body;
  const session = {
    id: uuidv4(),
    scenarioId,
    hostId,
    mode, // 'peer' | 'guided' | 'solo' | 'caregiver'
    status: 'active',
    startedAt: new Date().toISOString(),
    participants: [],
    messages: [],
  };
  sessions[session.id] = session;
  res.json({ session });
});

router.get('/:id', (req, res) => {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ session });
});

router.get('/', (req, res) => {
  const active = Object.values(sessions).filter(s => s.status === 'active');
  res.json({ sessions: active });
});

router.patch('/:id/end', (req, res) => {
  if (sessions[req.params.id]) {
    sessions[req.params.id].status = 'completed';
    sessions[req.params.id].endedAt = new Date().toISOString();
  }
  res.json({ success: true });
});

module.exports = router;
