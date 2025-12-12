import { Code, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface HowToUseProps {
  apiKey: string;
}

export function HowToUse({ apiKey }: HowToUseProps) {
  const [copied, setCopied] = useState(false);

  const sdkUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seoark-sdk?apiKey=${apiKey}`;

  const codeSnippet = `<!-- Add this script tag to your HTML <head> section -->
<script src="${sdkUrl}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Code className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">How to Use SEOark</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-3">
            Add the following script tag to your website's HTML, preferably in the{' '}
            <code className="px-2 py-1 bg-slate-100 rounded text-xs">&lt;head&gt;</code> section:
          </p>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{codeSnippet}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">What SEOark Does:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Automatically adds Open Graph meta tags</li>
            <li>Generates Twitter Card tags</li>
            <li>Creates canonical URLs</li>
            <li>Adds Schema.org structured data</li>
            <li>Optimizes page titles and descriptions</li>
            <li>Tracks SEO score improvements</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>The script will show a red error message if your subscription is inactive</li>
            <li>Sign in to your dashboard to manage your subscription</li>
            <li>Your SEO score updates automatically as pages are optimized</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
