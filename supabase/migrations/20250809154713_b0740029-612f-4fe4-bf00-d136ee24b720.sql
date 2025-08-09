-- Update default max_stories_per_month for free plan to 1
UPDATE public.profiles 
SET max_stories_per_month = 1 
WHERE subscription_plan = 'free' AND max_stories_per_month = 3;

-- Update default for new free users
ALTER TABLE public.profiles 
ALTER COLUMN max_stories_per_month 
SET DEFAULT 1;