import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const user = userData.user;
    console.log('Checking subscription for user:', user.email);

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log('No Stripe customer found, updating profile to free plan');
      
      // Update profile to free plan
      await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          subscription_active: false,
          stripe_customer_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ 
          subscription_active: false, 
          subscription_plan: 'free',
          stories_created_this_month: 0,
          max_stories_per_month: 2
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customerId = customers.data[0].id;
    console.log('Found Stripe customer:', customerId);

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    let subscriptionPlan = 'free';
    let subscriptionActive = false;
    let maxStoriesPerMonth = 2;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;

      // Determine plan based on price (in cents)
      if (amount === 900) { // 9€
        subscriptionPlan = 'starter';
        maxStoriesPerMonth = 3;
      } else if (amount === 1900) { // 19€
        subscriptionPlan = 'premium';
        maxStoriesPerMonth = -1; // unlimited
      }

      subscriptionActive = true;
      console.log('Active subscription found:', { plan: subscriptionPlan, amount });
    }

    // Update user profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: subscriptionPlan,
        subscription_active: subscriptionActive,
        stripe_customer_id: customerId,
        max_stories_per_month: maxStoriesPerMonth,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }

    console.log('Updated profile with subscription info:', { subscriptionPlan, subscriptionActive });

    return new Response(
      JSON.stringify({
        subscription_active: subscriptionActive,
        subscription_plan: subscriptionPlan,
        stories_created_this_month: profile?.stories_created_this_month || 0,
        max_stories_per_month: maxStoriesPerMonth
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});