import { Check, X } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const plans = [
    {
      name: 'Basic',
      price: 29,
      projects: 10,
      features: [
        'Up to 10 projects',
        'Basic SEO optimization',
        'Meta tags automation',
        'Monthly reports',
        'Email support',
      ],
    },
    {
      name: 'Pro',
      price: 79,
      projects: 50,
      popular: true,
      features: [
        'Up to 50 projects',
        'Advanced SEO optimization',
        'Schema markup',
        'Sitemap generation',
        'Real-time analytics',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: 199,
      projects: 'Unlimited',
      features: [
        'Unlimited projects',
        'Premium SEO optimization',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager',
        '24/7 phone support',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-8 my-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Upgrade Your Plan</h2>
            <p className="text-slate-600 mt-2">Choose the perfect plan for your needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border-2 rounded-xl p-6 ${
                plan.popular
                  ? 'border-blue-600 shadow-lg scale-105'
                  : 'border-slate-200 hover:border-slate-300'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {typeof plan.projects === 'number' ? `Up to ${plan.projects}` : plan.projects}{' '}
                  projects
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-900 text-center">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
