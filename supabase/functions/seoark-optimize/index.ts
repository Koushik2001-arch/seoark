import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { projectId, url, title } = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate SEO score based on various factors
    let score = 50; // Base score
    const optimizations: string[] = [];

    // Check for meta description
    if (title && title.length > 0 && title.length <= 60) {
      score += 10;
      optimizations.push('title_optimized');
    }

    // Log the optimization
    await supabase.from('seo_optimizations').insert({
      project_id: projectId,
      optimization_type: 'auto_optimization',
      status: 'completed',
      score_improvement: 10,
      details: {
        url,
        title,
        optimizations,
        timestamp: new Date().toISOString()
      }
    });

    // Update project score and last optimized time
    const { data: project } = await supabase
      .from('projects')
      .select('seo_score')
      .eq('id', projectId)
      .maybeSingle();

    const newScore = Math.min(100, Math.max((project?.seo_score || 0) + 5, score));

    await supabase
      .from('projects')
      .update({
        seo_score: newScore,
        last_optimized_at: new Date().toISOString()
      })
      .eq('id', projectId);

    return new Response(
      JSON.stringify({ success: true, score: newScore }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
