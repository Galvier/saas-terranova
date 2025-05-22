
// Follow Deno Edge Function pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { email, password, metadata } = await req.json();
    
    // Validate inputs
    if (!email) {
      throw new Error("Email is required");
    }

    // Check if user already exists using a compatible method for v2.38.4
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (userCheckError) {
      console.error("Error checking existing user:", userCheckError);
    }
    
    // Check if user already exists
    if (existingUsers) {
      // User exists, return user data
      console.log("User already exists:", existingUsers);
      return new Response(
        JSON.stringify({ 
          message: "User already exists", 
          user: existingUsers, 
          created: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user with service role privileges using compatible method
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password || undefined,
      email_confirm: true,
      user_metadata: metadata || {}
    });

    if (error) {
      throw error;
    }

    console.log("User created successfully:", data);
    
    // Return the created user data
    return new Response(
      JSON.stringify({ 
        message: "User created successfully", 
        user: data, 
        created: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error creating auth user:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        created: false
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
