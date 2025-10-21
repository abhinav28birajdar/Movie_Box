-- Movie Box - Supabase Database Schema
-- Execute these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE watchlist_status AS ENUM ('favorites', 'watch_later', 'watched');
CREATE TYPE notification_type AS ENUM ('movie_release', 'recommendation', 'social', 'system');

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  birth_date DATE,
  preferences JSONB DEFAULT '{
    "favorite_genres": [],
    "preferred_language": "en",
    "theme": "dark",
    "notifications_enabled": true,
    "public_profile": true
  }'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User watchlists
CREATE TABLE public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster_path TEXT,
  movie_release_date TEXT,
  movie_rating DECIMAL(3,1),
  status watchlist_status NOT NULL DEFAULT 'favorites',
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 10),
  notes TEXT,
  date_watched DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id, status)
);

-- User reviews and ratings
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  is_spoiler BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Review likes
CREATE TABLE public.review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id)
);

-- Review reports
CREATE TABLE public.review_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id)
);

-- Social following system
CREATE TABLE public.followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions for analytics
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  device_info JSONB,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movie collections (custom user lists)
CREATE TABLE public.movie_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  movie_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity feed
CREATE TABLE public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'watched_movie', 'rated_movie', 'added_to_watchlist', 'followed_user'
  movie_id INTEGER,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search history
CREATE TABLE public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_movie_id ON public.watchlist(movie_id);
CREATE INDEX idx_watchlist_status ON public.watchlist(status);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_movie_id ON public.reviews(movie_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX idx_followers_following_id ON public.followers(following_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON public.watchlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movie_collections_updated_at BEFORE UPDATE ON public.movie_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Watchlist policies
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist" ON public.watchlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Review likes policies
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review likes are viewable by everyone" ON public.review_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own review likes" ON public.review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review likes" ON public.review_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Followers policies
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Followers are viewable by everyone" ON public.followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.followers
  FOR DELETE USING (auth.uid() = follower_id);

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for common operations

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'watchlist_count', (SELECT COUNT(*) FROM public.watchlist WHERE user_id = user_uuid),
    'reviews_count', (SELECT COUNT(*) FROM public.reviews WHERE user_id = user_uuid AND is_published = true),
    'followers_count', (SELECT COUNT(*) FROM public.followers WHERE following_id = user_uuid),
    'following_count', (SELECT COUNT(*) FROM public.followers WHERE follower_id = user_uuid),
    'average_rating', (SELECT ROUND(AVG(rating), 1) FROM public.reviews WHERE user_id = user_uuid AND is_published = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add movie to watchlist
CREATE OR REPLACE FUNCTION add_to_watchlist(
  p_user_id UUID,
  p_movie_id INTEGER,
  p_movie_title TEXT,
  p_movie_poster_path TEXT DEFAULT NULL,
  p_movie_release_date TEXT DEFAULT NULL,
  p_movie_rating DECIMAL DEFAULT NULL,
  p_status watchlist_status DEFAULT 'favorites'
)
RETURNS UUID AS $$
DECLARE
  watchlist_id UUID;
BEGIN
  INSERT INTO public.watchlist (
    user_id, movie_id, movie_title, movie_poster_path, 
    movie_release_date, movie_rating, status
  ) VALUES (
    p_user_id, p_movie_id, p_movie_title, p_movie_poster_path,
    p_movie_release_date, p_movie_rating, p_status
  ) 
  ON CONFLICT (user_id, movie_id, status) 
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO watchlist_id;
  
  RETURN watchlist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get movie recommendations based on user's watchlist
CREATE OR REPLACE FUNCTION get_movie_recommendations(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  movie_id INTEGER,
  recommendation_score DECIMAL
) AS $$
BEGIN
  -- Simple recommendation based on genres of favorited movies
  -- This is a placeholder - you can implement more sophisticated algorithms
  RETURN QUERY
  SELECT 
    w.movie_id,
    AVG(w.movie_rating) as recommendation_score
  FROM public.watchlist w
  WHERE w.user_id = user_uuid 
    AND w.status = 'favorites'
    AND w.movie_rating IS NOT NULL
  GROUP BY w.movie_id
  ORDER BY recommendation_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('movie-images', 'movie-images', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);