'use client';

import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

const DEPENDENCIES_MAP: {
  [key: string]: {
    upstream: string[];
    downstream: string[];
    impactCount: number;
    risk: 'High' | 'Medium' | 'Low';
    radius: number;
    description: string;
  };
} = {
  'user-controller': {
    upstream: ['UserService', 'AuthService', 'AuthMiddleware'],
    downstream: ['UserService', 'db-users'],
    impactCount: 5,
    risk: 'Medium',
    radius: 45,
    description:
      'Core controller handling user-related API requests. Manages user retrieval and updates.',
  },
  'payment-service': {
    upstream: ['PaymentController'],
    downstream: ['db-users', 'db-transactions'],
    impactCount: 8,
    risk: 'High',
    radius: 72,
    description:
      'Payment processing service. Handles transaction logic and integrates with Stripe API.',
  },
  'auth-middleware': {
    upstream: ['api-users', 'api-payments'],
    downstream: ['AuthService', 'db-auth-logs'],
    impactCount: 12,
    risk: 'High',
    radius: 85,
    description:
      'Authentication middleware. Validates JWT tokens and enforces role-based access control.',
  },
  'db-users': {
    upstream: ['UserService', 'PaymentService'],
    downstream: ['db-transactions'],
    impactCount: 6,
    risk: 'Medium',
    radius: 54,
    description: 'PostgreSQL table storing user account information and credentials.',
  },
  default: {
    upstream: [],
    downstream: [],
    impactCount: 0,
    risk: 'Low',
    radius: 0,
    description: 'Click on a node to see its dependencies.',
  },
};

interface DependencyPanelProps {
  nodeId: string;
}

export default function DependencyPanel({ nodeId }: DependencyPanelProps) {
  const deps = DEPENDENCIES_MAP[nodeId] || DEPENDENCIES_MAP.default;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 pr-12 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Blast Radius Analysis</h3>
              <p className="text-xs text-muted-foreground mt-1">Impact of changes to this component</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
            deps.risk === 'High' ? 'bg-red-500/10 text-red-500' :
            deps.risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
            'bg-emerald-500/10 text-emerald-500'
          }`}>
            {deps.risk} Risk
          </div>
        </div>
      </div>

      {/* Blast Radius Visual */}
      <div className="p-6 border-b border-border space-y-4">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Blast Radius</span>
            <span className="text-sm font-bold text-foreground">{deps.radius}%</span>
          </div>
          <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/50">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                deps.risk === 'High' ? 'bg-red-500' :
                deps.risk === 'Medium' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${deps.radius}%` }}
            />
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">
              Directly impacts {deps.impactCount} components
            </span>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{deps.description}</p>
        </div>
      </div>

      {/* Dependencies */}
      <div className="flex-1 overflow-y-auto">
        {/* Upstream */}
        {deps.upstream.length > 0 && (
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Upstream Dependencies</h4>
            </div>
            <div className="space-y-2">
              {deps.upstream.map((dep) => (
                <div
                  key={dep}
                  className="px-3 py-2 bg-secondary/30 rounded-lg border border-secondary/50 text-xs text-foreground/80"
                >
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Downstream */}
        {deps.downstream.length > 0 && (
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-foreground">Downstream Dependencies</h4>
            </div>
            <div className="space-y-2">
              {deps.downstream.map((dep) => (
                <div
                  key={dep}
                  className="px-3 py-2 bg-secondary/30 rounded-lg border border-secondary/50 text-xs text-foreground/80"
                >
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="p-6 border-t border-border bg-secondary/20">
        <button className="w-full px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          Review Impact
        </button>
      </div>
    </div>
  );
}
