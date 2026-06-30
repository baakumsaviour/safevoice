-- Run this script in your Supabase SQL Editor to support the AI Chat Responder

-- Add the ai_active flag to the cases table
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS ai_active BOOLEAN DEFAULT true;

-- Update existing cases to have ai_active = false so AI doesn't suddenly reply to old cases
UPDATE public.cases SET ai_active = false WHERE ai_active IS NULL;
