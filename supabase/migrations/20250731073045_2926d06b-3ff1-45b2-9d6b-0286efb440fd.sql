-- Create print_orders table to track print-on-demand orders
CREATE TABLE public.print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  gelato_order_id TEXT,
  product_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER,
  currency TEXT DEFAULT 'eur',
  customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for print orders
CREATE POLICY "Users can view their own print orders" 
ON public.print_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own print orders" 
ON public.print_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Edge functions can update print orders" 
ON public.print_orders 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_print_orders_updated_at
BEFORE UPDATE ON public.print_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();