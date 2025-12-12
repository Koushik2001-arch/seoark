import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProjectsList } from './ProjectsList';
import { SubscriptionCard } from './SubscriptionCard';
import { CreateProjectModal } from './CreateProjectModal';
import { UpgradeModal } from './UpgradeModal';
import { LogOut, Plus } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  subscription_status: string;
  trial_start_date: string;
  trial_end_date: string;
  projects_used: number;
  max_projects: number;
}

interface Subscription {
  plan_type: string;
  status: string;
  amount_due: number;
  ends_at: string;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [user, refreshTrigger]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setProfile(profileData);
      setSubscription(subData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const isTrialExpired = profile && new Date(profile.trial_end_date) < new Date();
  const canCreateProject = profile && profile.projects_used < profile.max_projects && !isTrialExpired;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SEOark</h1>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile && subscription && (
          <SubscriptionCard
            profile={profile}
            subscription={subscription}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        )}

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
              <p className="text-sm text-slate-600 mt-1">
                {profile?.projects_used || 0} of {profile?.max_projects || 3} projects used
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!canCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {!canCreateProject && profile && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                {isTrialExpired
                  ? 'Your trial has expired. Please upgrade to continue.'
                  : 'You have reached your project limit. Upgrade to create more projects.'}
              </p>
            </div>
          )}

          <ProjectsList onUpdate={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
