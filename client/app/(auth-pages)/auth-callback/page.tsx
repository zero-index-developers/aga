'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('GitHub authentication was cancelled or failed.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received from GitHub.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        await authService.handleGitHubCallback(code);
        toast.success('Successfully authenticated with GitHub!');
        router.push('/app/repos');
      } catch (err) {
        console.error('GitHub callback error:', err);
        setError('Failed to complete GitHub authentication. Please try again.');
        setTimeout(() => router.push('/login'), 3000);
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

// Made with Bob