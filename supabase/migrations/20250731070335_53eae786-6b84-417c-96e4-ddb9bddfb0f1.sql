-- Update max stories for free plan to 1 instead of 2
UPDATE profiles SET max_stories_per_month = 1 WHERE subscription_plan = 'free';