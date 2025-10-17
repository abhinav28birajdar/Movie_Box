-- Create the 'watchlists' table
CREATE TABLE watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_tmdb_id INT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  release_date TEXT,
  overview TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a unique constraint to ensure a user can only add a movie to their watchlist once
ALTER TABLE watchlists
ADD CONSTRAINT unique_user_movie UNIQUE (user_id, movie_tmdb_id);

-- Enable Row Level Security (RLS) on the 'watchlists' table
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can SELECT their own watchlist items
CREATE POLICY "Users can view their own watchlist items." ON watchlists
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can INSERT their own watchlist items
CREATE POLICY "Users can add movies to their own watchlist." ON watchlists
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can DELETE their own watchlist items
CREATE POLICY "Users can remove movies from their own watchlist." ON watchlists
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- (Optional) Create a 'profiles' table if you want to store additional user data,
-- though not strictly used in this basic app beyond auth.users.
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT UNIQUE,
  avatar_url TEXT,

  PRIMARY KEY (id),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Public profiles are viewable by authenticated users." ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);