const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Placeholder: replace with real DB queries via Prisma
const mockUsers = [
  { id: '1', name: 'Alex (AAC User)', email: 'alex@demo.com', passwordHash: '', role: 'user' },
  { id: '2', name: 'Therapist Alvina', email: 'alvina@spd.org.sg', passwordHash: '', role: 'therapist' },
];

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // In production: await bcrypt.compare(password, user.passwordHash)
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, dob } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  // TODO: Insert into PostgreSQL via Prisma
  res.json({ message: 'Registration successful (DB integration pending)' });
});

module.exports = router;
