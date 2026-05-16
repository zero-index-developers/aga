import { Network } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/">
            <div className="p-2 bg-primary rounded-lg inline-flex">
              <Network className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">AGA</h1>
          <p className="text-sm text-muted-foreground">Architecture Governance Agent</p>
        </div>
        {children}
      </div>
    </div>
  );
}
