import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Database } from '../lib/supabase';
import { Globe, Copy, CheckCircle, AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { HowToUse } from './HowToUse';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsListProps {
  onUpdate: () => void;
}

export function ProjectsList({ onUpdate }: ProjectsListProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = (apiKey: string, projectId: string) => {
    navigator.clipboard.writeText(apiKey);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'paused':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No projects yet. Create your first project to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-600">{project.domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(project.status)}
              <span className="text-sm text-slate-600 capitalize">{project.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <p className="text-xs text-slate-600 font-medium">SEO Score</p>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(project.seo_score)}`}>
                {project.seo_score}/100
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-medium mb-1">Optimization Level</p>
              <p className="text-2xl font-bold text-slate-900 capitalize">
                {project.optimization_level}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-medium mb-1">Last Optimized</p>
              <p className="text-sm text-slate-900">
                {project.last_optimized_at
                  ? new Date(project.last_optimized_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 font-medium">API Key (use this in your code)</p>
              <button
                onClick={() => copyApiKey(project.api_key, project.id)}
                className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copiedId === project.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <code className="text-sm text-green-400 font-mono break-all">{project.api_key}</code>
          </div>

          <button
            onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
          >
            {expandedId === project.id ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Integration Guide
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Integration Guide
              </>
            )}
          </button>

          {expandedId === project.id && (
            <div className="mt-4">
              <HowToUse apiKey={project.api_key} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
