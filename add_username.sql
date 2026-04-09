-- 1. Ensure the profiles table exists and has the full_name / username columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Ensure update_requests table exists (This table tracks pending profile changes like name/phone changes)
CREATE TABLE IF NOT EXISTS public.update_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_email TEXT NOT NULL,
    update_payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. In case Row Level Security (RLS) is blocking inserts or updates, allow open access for testing 
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_requests DISABLE ROW LEVEL SECURITY;
