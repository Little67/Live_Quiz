-- Add user_id column to presentations table
ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
DROP POLICY IF EXISTS "Anyone can view presentations" ON presentations;
DROP POLICY IF EXISTS "Users can insert their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON presentations;

-- Policies

-- 1. View: Allow everyone to view presentations (needed for participants to join)
CREATE POLICY "Anyone can view presentations"
  ON presentations FOR SELECT
  USING (true);

-- 2. Insert: Only authenticated users can create
CREATE POLICY "Users can insert their own presentations"
  ON presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Update: Only owner can update
CREATE POLICY "Users can update their own presentations"
  ON presentations FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Delete: Only owner can delete
CREATE POLICY "Users can delete their own presentations"
  ON presentations FOR DELETE
  USING (auth.uid() = user_id);
