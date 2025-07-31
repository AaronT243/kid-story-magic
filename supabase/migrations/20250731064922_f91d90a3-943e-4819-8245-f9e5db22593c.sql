-- Fix subscription plan enum to include 'free' plan
ALTER TYPE subscription_plan ADD VALUE 'free';

-- Update profiles table to use 'free' as default instead of 'starter'
ALTER TABLE profiles ALTER COLUMN subscription_plan SET DEFAULT 'free';