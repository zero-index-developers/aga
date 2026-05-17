"use client";

import { 
  AlertTriangle, 
  CheckCircle2, 
  FileCode2, 
  ShieldAlert, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@client/components/ui/dialog";
import { Button } from "@client/components/ui/button";
import { getRiskColor } from "@client/lib/utils";

interface ReviewImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  risk: 'High' | 'Medium' | 'Low';
  impactCount: number;
}

const IMPACT_DETAILS: Record<string, {
  files: string[];
  recommendations: string[];
  reliabilityScore: number;
}> = {
  'auth-middleware': {
    files: ['middleware.ts', 'app/api/auth/route.ts', 'hooks/use-auth.ts', 'lib/jwt.ts'],
    recommendations: [
      'Perform full regression test on Login flow',
      'Verify session persistence across subdomains',
      'Check rate limiting interaction with new changes',
      'Audit JWT signing key rotation'
    ],
    reliabilityScore: 82
  },
  'payment-service': {
    files: ['lib/stripe.ts', 'app/api/webhook/route.ts', 'services/billing.ts', 'db/schema.ts'],
    recommendations: [
      'Test webhook idempotency with Stripe CLI',
      'Verify transaction rollback on database failure',
      'Validate currency conversion logic for international users',
      'Update PCI compliance audit logs'
    ],
    reliabilityScore: 94
  },
  'user-controller': {
    files: ['app/api/user/route.ts', 'components/user-profile.tsx', 'actions/user-actions.ts'],
    recommendations: [
      'Check data sanitization for profile updates',
      'Verify cache invalidation for user metadata',
      'Test optimistic UI updates in the dashboard'
    ],
    reliabilityScore: 88
  },
  'default': {
    files: ['Affected core logic files'],
    recommendations: [
      'Review unit tests for this component',
      'Check downstream service dependencies',
      'Validate input schema integrity'
    ],
    reliabilityScore: 90
  }
};

export function ReviewImpactDialog({ 
  open, 
  onOpenChange, 
  nodeId, 
  risk, 
  impactCount 
}: ReviewImpactDialogProps) {
  const details = IMPACT_DETAILS[nodeId] || IMPACT_DETAILS.default;

  const riskColor = getRiskColor(risk);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${riskColor}`}>
              {risk} Risk Level
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Impact Score: {impactCount * 8}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Blast Radius Report
            <span className="text-muted-foreground font-normal text-lg">/ {nodeId}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-1">
            Comprehensive analysis of system-wide effects resulting from modifications to this component.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Affected Files */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5" />
              Affected Files
            </h4>
            <div className="space-y-1.5">
              {details.files.map((file) => (
                <div key={file} className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/20 px-2 py-1.5 rounded-md border border-border/40">
                  <ArrowRight className="w-3 h-3 text-primary" />
                  {file}
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              System Reliability
            </h4>
            <div className="p-4 bg-secondary/10 rounded-xl border border-border/50 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-3xl font-black text-foreground mb-1">
                  {details.reliabilityScore}%
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Confidence score based on unit test coverage and dependency depth.
                </div>
              </div>
              <div 
                className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000" 
                style={{ width: `${details.reliabilityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recommended Safeguards
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {details.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {rec}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Analysis
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Export Report
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
