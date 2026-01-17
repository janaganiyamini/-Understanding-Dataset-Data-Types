/*
  # Dataset Analysis Schema

  1. New Tables
    - `datasets`
      - `id` (uuid, primary key)
      - `name` (text) - Dataset filename
      - `uploaded_at` (timestamptz) - Upload timestamp
      - `row_count` (integer) - Number of rows
      - `column_count` (integer) - Number of columns
      - `data` (jsonb) - Actual dataset data
      - `analysis` (jsonb) - Analysis results
      - `user_id` (uuid) - User who uploaded (optional for now)
  
  2. Security
    - Enable RLS on `datasets` table
    - Add policies for public access (since no auth is required)
*/

CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  row_count integer DEFAULT 0,
  column_count integer DEFAULT 0,
  data jsonb,
  analysis jsonb,
  user_id uuid
);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert datasets"
  ON datasets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view datasets"
  ON datasets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their datasets"
  ON datasets FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);