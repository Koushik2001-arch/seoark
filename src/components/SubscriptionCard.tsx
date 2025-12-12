import { Crown, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

interface Profile {
  subscription_status: string;
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

interface SubscriptionCardProps {
  profile: Profile;
  subscription: Subscription;
  onUpgrade: () => void;
}

export function SubscriptionCard({ profile, subscription, onUpgrade }: SubscriptionCardProps) {
  const isTrialExpired = new Date(profile.trial_end_date) < new Date();
  const daysRemaining = Math.ceil(
    (new Date(profile.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = () => {
    if (subscription.status === 'active' && !isTrialExpired) return 'bg-green-50 border-green-200';
    if (subscription.status === 'payment_due' || isTrialExpired) return 'bg-red-50 border-red-200';
    return 'bg-amber-50 border-amber-200';
  };

  const getStatusText = () => {
    if (isTrialExpired) return 'Trial Expired';
    if (subscription.status === 'payment_due') return 'Payment Due';
    if (subscription.status === 'active' && subscription.plan_type === 'trial') {
      return `Trial Active (${daysRemaining} days left)`;
    }
    return 'Active';
  };

  const getOptimizationLevel = () => {
    if (profile.projects_used === 0) return 'low';
    if (profile.projects_used >= 2) return 'high';
    return 'medium';
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${getStatusColor()}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg">
            <Crown className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Plan Type</p>
            <p className="text-xl font-bold text-slate-900 capitalize">{subscription.plan_type}</p>
            <p className="text-xs text-slate-500 mt-1">{getStatusText()}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Valid Until</p>
            <p className="text-xl font-bold text-slate-900">
              {new Date(profile.trial_end_date).toLocaleDateString()}
            </p>
            {subscription.amount_due > 0 && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                Due: ${subscription.amount_due.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg">
            <TrendingUp className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Optimization Level</p>
            <p className="text-xl font-bold text-slate-900 capitalize">{getOptimizationLevel()}</p>
            <div className="flex gap-1 mt-2">
              <div className={`h-1.5 w-8 rounded ${getOptimizationLevel() === 'low' || getOptimizationLevel() === 'medium' || getOptimizationLevel() === 'high' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <div className={`h-1.5 w-8 rounded ${getOptimizationLevel() === 'medium' || getOptimizationLevel() === 'high' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <div className={`h-1.5 w-8 rounded ${getOptimizationLevel() === 'high' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {(isTrialExpired || subscription.status === 'payment_due') && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-white rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 mb-2">Action Required</p>
            <p className="text-sm text-slate-600 mb-3">
              {isTrialExpired
                ? 'Your trial period has ended. Upgrade to continue using SEOark.'
                : 'You have an outstanding payment. Please complete payment to continue.'}
            </p>
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
