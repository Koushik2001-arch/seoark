import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('apiKey');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
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

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (
          subscription_status,
          trial_end_date
        )
      `)
      .eq('api_key', apiKey)
      .maybeSingle();

    if (error || !project) {
      return new Response(
        generateSDKScript(false, 'Invalid API key'),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
        }
      );
    }

    const profile = project.profiles as any;
    const isExpired = new Date(profile.trial_end_date) < new Date();
    const isActive = profile.subscription_status === 'active' || profile.subscription_status === 'trial';
    const canUse = isActive && !isExpired;

    if (!canUse) {
      return new Response(
        generateSDKScript(false, 'Subscription expired or inactive'),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
        }
      );
    }

    return new Response(
      generateSDKScript(true, null, project),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      generateSDKScript(false, 'Internal server error'),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
      }
    );
  }
});

function generateSDKScript(isActive: boolean, errorMessage: string | null, project?: any) {
  if (!isActive) {
    return `
(function() {
  console.error('SEOark Error: ${errorMessage || 'Unauthorized'}');
  console.error('Please sign in at https://seoark.com to activate your subscription');
  
  // Show visual error indicator
  const style = document.createElement('style');
  style.textContent = 'body::after { content: "⚠️ SEOark: ${errorMessage || 'Please sign in'}"; position: fixed; bottom: 20px; right: 20px; background: #ef4444; color: white; padding: 12px 20px; border-radius: 8px; font-family: system-ui; font-size: 14px; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }';
  document.head.appendChild(style);
})();
`;
  }

  return `
(function() {
  console.log('SEOark: Optimization active for ${project?.domain}');
  
  // Auto-optimize meta tags
  const optimizeMetaTags = () => {
    // Add Open Graph tags if missing
    if (!document.querySelector('meta[property="og:title"]')) {
      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.content = document.title;
      document.head.appendChild(ogTitle);
    }

    if (!document.querySelector('meta[property="og:description"]')) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        ogDesc.content = metaDesc.getAttribute('content') || '';
        document.head.appendChild(ogDesc);
      }
    }

    if (!document.querySelector('meta[property="og:url"]')) {
      const ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      ogUrl.content = window.location.href;
      document.head.appendChild(ogUrl);
    }

    // Add Twitter Card tags if missing
    if (!document.querySelector('meta[name="twitter:card"]')) {
      const twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      twitterCard.content = 'summary_large_image';
      document.head.appendChild(twitterCard);
    }

    // Add canonical URL if missing
    if (!document.querySelector('link[rel="canonical"]')) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href.split('?')[0];
      document.head.appendChild(canonical);
    }

    // Add schema.org markup
    if (!document.querySelector('script[type="application/ld+json"]')) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": document.title,
        "url": window.location.origin
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  };

  // Run optimization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeMetaTags);
  } else {
    optimizeMetaTags();
  }

  // Report optimization to server
  fetch('${Deno.env.get('SUPABASE_URL')}/functions/v1/seoark-optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}'
    },
    body: JSON.stringify({
      projectId: '${project?.id}',
      url: window.location.href,
      title: document.title
    })
  }).catch(() => {});
})();
`;
}
