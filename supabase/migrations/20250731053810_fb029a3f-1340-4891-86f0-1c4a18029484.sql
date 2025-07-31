-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  characters TEXT[] DEFAULT '{}',
  theme TEXT,
  story_length TEXT DEFAULT 'medium',
  content TEXT,
  illustration_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stories" 
ON public.stories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
ON public.stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();