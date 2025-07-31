-- Update max stories for free plan to 2 instead of 1
UPDATE profiles SET max_stories_per_month = 2 WHERE subscription_plan = 'free';