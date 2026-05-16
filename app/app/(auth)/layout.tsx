import { Network } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-md inline-flex">
                <Network className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">AGA Console</span>
            </div>
          </Link>
          <p className="text-sm text-muted-foreground pt-1">Architecture Governance Agent</p>
        </div>
        {children}
      </div>
    </div>
  );
}
