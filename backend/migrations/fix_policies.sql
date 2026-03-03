-- Allow service role to perform all operations
DROP POLICY IF EXISTS "Allow service role all access" ON evolution_history;
CREATE POLICY "Allow service role all access" ON evolution_history FOR ALL USING (true) WITH CHECK (true);

-- Ensure public can read (for the API)
DROP POLICY IF EXISTS "Allow public read access for evolution_history" ON evolution_history;
CREATE POLICY "Allow public read access for evolution_history" ON evolution_history FOR SELECT USING (true);
