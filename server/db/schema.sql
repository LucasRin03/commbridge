-- CommBridge PostgreSQL Schema
-- Run: psql -U postgres -f server/db/schema.sql

CREATE DATABASE commbridge;
\c commbridge;

-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'therapist', 'caregiver', 'admin')),
  dob         DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios
CREATE TABLE scenarios (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  icon        TEXT,
  difficulty  TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  prompts     JSONB DEFAULT '[]'
);

INSERT INTO scenarios (title, icon, difficulty, prompts) VALUES
  ('Ordering Food', '🍜', 'beginner', '["What would you like to order?", "How many?", "Would you like a drink?"]'),
  ('Grocery Shopping', '🛒', 'intermediate', '["Can I help you find something?", "Do you have a loyalty card?"]'),
  ('Public Transport', '🚌', 'intermediate', '["Where would you like to go?", "Do you have an EZ-Link card?"]'),
  ('Clinic Visit', '🏥', 'advanced', '["What brings you in today?", "How long have you had this symptom?"]'),
  ('Social Greetings', '👋', 'beginner', '["Hello! How are you today?", "Nice to meet you!"]'),
  ('Asking for Help', '🆘', 'beginner', '["How can I help you?", "Are you okay?"]');

-- Sessions
CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id INTEGER REFERENCES scenarios(id),
  host_id     UUID REFERENCES users(id),
  mode        TEXT CHECK (mode IN ('peer', 'guided', 'solo', 'caregiver')),
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  ended_at    TIMESTAMPTZ
);

-- Session participants
CREATE TABLE session_participants (
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES users(id),
  content     TEXT,
  symbols     JSONB DEFAULT '[]',
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id),
  scenario_id         INTEGER REFERENCES scenarios(id),
  sessions_completed  INTEGER DEFAULT 0,
  last_session_at     TIMESTAMPTZ,
  therapist_notes     TEXT,
  UNIQUE (user_id, scenario_id)
);

-- Indexes
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_sessions_host ON sessions(host_id);
CREATE INDEX idx_progress_user ON progress(user_id);
