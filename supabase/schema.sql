-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    leetcode_username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current Stats
CREATE TABLE stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    easy INTEGER DEFAULT 0,
    medium INTEGER DEFAULT 0,
    hard INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    contest_rating DOUBLE PRECISION DEFAULT 0,
    contest_ranking INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    raw_json JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily History
CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    easy INTEGER DEFAULT 0,
    medium INTEGER DEFAULT 0,
    hard INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    contest_rating DOUBLE PRECISION DEFAULT 0,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_username ON users(leetcode_username);
CREATE INDEX idx_history_user ON history(user_id);
CREATE INDEX idx_history_date ON history(fetched_at);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access
-- Anyone can view the leaderboard data
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on stats" ON stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access on history" ON history FOR SELECT USING (true);

-- 2. Admin Read Access
-- Only admins can see the admins table (or we can just leave it to service role)
-- But since we check if the logged in user is an admin in Next.js, they need to be able to read it
CREATE POLICY "Allow users to read admins" ON admins FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Admin Write Access for Users Table
-- To allow Server Actions to mutate the users table, we check if the executing user's email exists in the admins table
CREATE POLICY "Allow admins to insert users" ON users FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
);

CREATE POLICY "Allow admins to update users" ON users FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
);

CREATE POLICY "Allow admins to delete users" ON users FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
);

-- Note: 
-- The /api/update endpoint uses the Service Role Key, which automatically bypasses ALL RLS policies.
-- Therefore, we don't need to write explicit INSERT/UPDATE policies for the `stats` and `history` tables,
-- because only the Service Role Key mutates them.
