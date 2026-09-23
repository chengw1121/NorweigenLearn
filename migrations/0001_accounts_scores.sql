PRAGMA foreign_keys = ON;

-- Authentication and private email addresses are managed by Supabase Auth.
-- D1 stores only the public leaderboard profile and learning scores.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at TEXT NOT NULL
);
CREATE INDEX users_points ON users(points DESC);

CREATE TABLE score_events (
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('answer','vocab','completion')),
  points INTEGER NOT NULL CHECK (points >= 0),
  created_at TEXT NOT NULL
);
CREATE INDEX score_events_user_date ON score_events(user_id,created_at);
CREATE INDEX score_events_date ON score_events(created_at);

CREATE TABLE medals (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  earned_at TEXT NOT NULL,
  PRIMARY KEY(user_id,code)
);
CREATE INDEX medals_user_date ON medals(user_id,earned_at DESC);
