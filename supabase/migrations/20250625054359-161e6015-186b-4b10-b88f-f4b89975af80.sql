
-- Create profiles table for user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  is_adult BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  backdrop_url TEXT,
  release_year INTEGER,
  rating NUMERIC(3,1),
  genre TEXT,
  age_rating TEXT,
  type TEXT CHECK (type IN ('movie', 'series')) DEFAULT 'movie',
  duration INTEGER, -- in minutes for movies
  seasons INTEGER DEFAULT 1, -- for series
  episodes JSONB, -- for series episodes structure
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watch_later table
CREATE TABLE public.watch_later (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles NOT NULL,
  movie_id UUID REFERENCES public.movies NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_later ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for movies (public read, admin write)
CREATE POLICY "Anyone can view movies" 
  ON public.movies 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only authenticated users can insert movies" 
  ON public.movies 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update movies" 
  ON public.movies 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete movies" 
  ON public.movies 
  FOR DELETE 
  TO authenticated
  USING (true);

-- RLS Policies for watch_later
CREATE POLICY "Users can view their profiles' watch later" 
  ON public.watch_later 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = watch_later.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add to their profiles' watch later" 
  ON public.watch_later 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = watch_later.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from their profiles' watch later" 
  ON public.watch_later 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = watch_later.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample movies
INSERT INTO public.movies (title, description, video_url, poster_url, backdrop_url, release_year, rating, genre, age_rating, type) VALUES
(
  'The Matrix',
  'محاولة كيانو ريفز في اكتشاف حقيقة الواقع والعالم الافتراضي في فيلم الخيال العلمي الملحمي',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
  1999,
  8.7,
  'خيال علمي',
  '+16',
  'movie'
),
(
  'Stranger Things',
  'مسلسل رعب خارق للطبيعة يتبع مجموعة من الأطفال في مواجهة قوى شريرة',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400',
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200',
  2016,
  8.5,
  'رعب',
  '+13',
  'series'
);
