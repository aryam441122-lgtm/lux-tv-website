
-- Create storage bucket for movies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'movies', 
  'movies', 
  true, 
  2147483648, -- 2GB limit
  ARRAY['video/mp4']
);

-- Create storage policy for movies bucket
CREATE POLICY "Anyone can view movie files" ON storage.objects
FOR SELECT USING (bucket_id = 'movies');

CREATE POLICY "Authenticated users can upload movie files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'movies' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'movies'
);

CREATE POLICY "Authenticated users can update movie files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'movies' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete movie files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'movies' 
  AND auth.role() = 'authenticated'
);

-- Add new columns to movies table to track file uploads
ALTER TABLE movies ADD COLUMN IF NOT EXISTS video_file_path TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS video_file_name TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS use_file_instead_of_url BOOLEAN DEFAULT FALSE;

-- Update episodes structure to support file uploads
-- Episodes will now support both URL and file path per episode
COMMENT ON COLUMN movies.episodes IS 'JSON structure: [{"season": 1, "episode": 1, "title": "Episode Title", "video_url": "https://...", "video_file_path": "movies/series_name/s1e1.mp4", "video_file_name": "s1e1.mp4", "use_file_instead_of_url": false}]';
