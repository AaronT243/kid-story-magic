-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_plan public.subscription_plan DEFAULT 'free',
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN stories_created_this_month INTEGER DEFAULT 0,
ADD COLUMN monthly_story_limit INTEGER DEFAULT 1;

-- Create index for efficient subscription queries
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_plan, subscription_status);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- Create function to reset monthly story counts
CREATE OR REPLACE FUNCTION public.reset_monthly_story_counts()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET stories_created_this_month = 0
  WHERE DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', updated_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can create stories
CREATE OR REPLACE FUNCTION public.can_create_story(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE profiles.user_id = can_create_story.user_id;
  
  -- Premium users have unlimited stories
  IF user_profile.subscription_plan = 'premium' AND user_profile.subscription_status = 'active' THEN
    RETURN true;
  END IF;
  
  -- Starter users have 3 stories per month
  IF user_profile.subscription_plan = 'starter' AND user_profile.subscription_status = 'active' THEN
    RETURN user_profile.stories_created_this_month < 3;
  END IF;
  
  -- Free users have 1 story per month
  RETURN user_profile.stories_created_this_month < user_profile.monthly_story_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment story count
CREATE OR REPLACE FUNCTION public.increment_story_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET stories_created_this_month = stories_created_this_month + 1,
      updated_at = NOW()
  WHERE profiles.user_id = increment_story_count.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;