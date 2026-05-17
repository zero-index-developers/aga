'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const token = searchParams.get('token') || hashParams.get('token');
      const hashError = hashParams.get('error');

      if (errorParam || hashError) {
        setError('GitHub authentication was cancelled or failed.');
        setTimeout(() => router.replace('/login'), 3000);
        return;
      }

      if (token) {
        authService.setToken(token);
        toast.success('Successfully authenticated with GitHub!');
        window.location.replace('/app/repos');
        return;
      }

      if (!code) {
        setError('No authorization code received from GitHub.');
        setTimeout(() => router.replace('/login'), 3000);
        return;
      }

      try {
        await authService.handleGitHubCallback(code);
        toast.success('Successfully authenticated with GitHub!');
        window.location.replace('/app/repos');
      } catch (err) {
        console.error('GitHub callback error:', err);
        setError('Failed to complete GitHub authentication. Please try again.');
        setTimeout(() => router.replace('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-destructive text-lg font-semibold">{error}</div>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Spinner className="mx-auto h-8 w-8" />
            <div className="text-lg font-semibold">Completing GitHub authentication...</div>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="mx-auto h-8 w-8" />
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

// Made with Bob
