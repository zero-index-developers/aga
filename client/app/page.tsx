import Link from "next/link";
import { Network } from "lucide-react";
import { Button } from "@client/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary rounded-2xl shadow-lg">
            <Network className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight">
          Architecture Governance Agent
        </h1>

        <p className="text-xl text-muted-foreground">
          Google Maps for Software Architecture. Visualize, analyze, and understand your codebase dependencies with AI-powered insights.
        </p>

        <div className="flex justify-center gap-4 pt-8">
          <Link href={process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3000/"}>
            <Button size="lg" className="h-12 px-8 text-lg">
              Open Dashboard
            </Button>
          </Link>
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3000"}/register`}>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
