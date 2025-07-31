-- Update default subscription plan to 'free' and reset story counts
UPDATE profiles SET 
  subscription_plan = 'free',
  stories_created_this_month = 0
WHERE subscription_plan = 'starter' OR subscription_plan IS NULL;

-- Update default value for new profiles
ALTER TABLE profiles ALTER COLUMN subscription_plan SET DEFAULT 'free';