-- MovieBox Database Schema for Supabase
-- This file contains all the necessary tables and Row Level Security (RLS) policies

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 1. Profiles table (extends auth.users with additional user data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  avatar_url TEXT DEFAULT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (TRUE);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- 2. Watchlists table (stores movies saved by users)
CREATE TABLE watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT DEFAULT NULL,
  release_date TEXT DEFAULT NULL,
  overview TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_tmdb_id)
);

-- Enable RLS for watchlists
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Watchlists RLS Policies
CREATE POLICY "Users can view their own watchlist" 
ON watchlists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist" 
ON watchlists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own watchlist" 
ON watchlists FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Reviews table (stores user ratings and reviews for movies)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_tmdb_id INTEGER NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_tmdb_id)
);

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS Policies
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (TRUE);

CREATE POLICY "Users can add their own reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON reviews FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Lists table (custom movie lists created by users)
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 3 AND 100),
  description TEXT DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for lists
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Lists RLS Policies
CREATE POLICY "Users can view their own lists" 
ON lists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public lists are viewable by everyone" 
ON lists FOR SELECT 
USING (is_public = TRUE);

CREATE POLICY "Users can create their own lists" 
ON lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" 
ON lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" 
ON lists FOR DELETE 
USING (auth.uid() = user_id);

-- 5. List_movies table (join table for lists and movies)
CREATE TABLE list_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  movie_tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT DEFAULT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_index INTEGER DEFAULT 0,
  UNIQUE(list_id, movie_tmdb_id)
);

-- Enable RLS for list_movies
ALTER TABLE list_movies ENABLE ROW LEVEL SECURITY;

-- List_movies RLS Policies
CREATE POLICY "Users can view movies in their own lists" 
ON list_movies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = list_movies.list_id 
    AND lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view movies in public lists" 
ON list_movies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = list_movies.list_id 
    AND lists.is_public = TRUE
  )
);

CREATE POLICY "Users can add movies to their own lists" 
ON list_movies FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = list_movies.list_id 
    AND lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove movies from their own lists" 
ON list_movies FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = list_movies.list_id 
    AND lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update movies in their own lists" 
ON list_movies FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = list_movies.list_id 
    AND lists.user_id = auth.uid()
  )
);

-- Indexes for better performance
CREATE INDEX watchlists_user_id_idx ON watchlists(user_id);
CREATE INDEX watchlists_movie_tmdb_id_idx ON watchlists(movie_tmdb_id);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE INDEX reviews_movie_tmdb_id_idx ON reviews(movie_tmdb_id);
CREATE INDEX lists_user_id_idx ON lists(user_id);
CREATE INDEX lists_is_public_idx ON lists(is_public);
CREATE INDEX list_movies_list_id_idx ON list_movies(list_id);
CREATE INDEX list_movies_movie_tmdb_id_idx ON list_movies(movie_tmdb_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at 
  BEFORE UPDATE ON lists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)));
  RETURN new;
END;
$$;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for avatars (run this in Supabase Dashboard or via SDK)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policy for avatars
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);