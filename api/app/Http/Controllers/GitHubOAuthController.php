<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GitHubOAuthController extends Controller
{
    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function redirectToGitHub()
    {
        try {
            if (
                !config('services.github.client_id') ||
                !config('services.github.client_secret') ||
                !config('services.github.redirect')
            ) {
                return $this->oauthFailure(
                    request(),
                    'GitHub OAuth is not configured. Check GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_REDIRECT_URI.'
                );
            }

            $url = Socialite::driver('github')
                ->scopes(config('services.github.scopes', ['user:email', 'read:user', 'repo']))
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            if (request()->expectsJson()) {
                return response()->json([
                    'url' => $url,
                ]);
            }

            return redirect()->away($url);
        } catch (\Exception $e) {
            Log::error('GitHub OAuth redirect failed', [
                'message' => $e->getMessage(),
            ]);

            return $this->oauthFailure(request(), 'Failed to initiate GitHub login.');
        }
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleGitHubCallback(Request $request)
    {
        try {
            if ($request->has('error')) {
                return $this->oauthFailure($request, 'GitHub authentication was cancelled or failed.');
            }

            // Get the GitHub user
            $githubUser = Socialite::driver('github')
                ->stateless()
                ->user();
            $githubId = (string) $githubUser->getId();
            $githubEmail = $githubUser->getEmail() ?: "github-{$githubId}@users.noreply.github.com";
            $githubName = $githubUser->getName() ?: $githubUser->getNickname() ?: "GitHub User {$githubId}";

            // Find or create user
            $user = User::where('github_id', $githubId)->first();

            if ($user) {
                // Update existing user's GitHub token and avatar
                $user->update([
                    'github_token' => $githubUser->token,
                    'github_refresh_token' => $githubUser->refreshToken,
                    'avatar' => $githubUser->getAvatar(),
                ]);
            } else {
                // Check if user exists with this email
                $user = User::where('email', $githubEmail)->first();

                if ($user) {
                    // Link GitHub account to existing user
                    $user->update([
                        'github_id' => $githubId,
                        'github_token' => $githubUser->token,
                        'github_refresh_token' => $githubUser->refreshToken,
                        'avatar' => $githubUser->getAvatar(),
                    ]);
                } else {
                    // Create new user
                    $user = User::create([
                        'name' => $githubName,
                        'email' => $githubEmail,
                        'github_id' => $githubId,
                        'github_token' => $githubUser->token,
                        'github_refresh_token' => $githubUser->refreshToken,
                        'avatar' => $githubUser->getAvatar(),
                        'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                        'email_verified_at' => now(), // GitHub emails are verified
                    ]);
                }
            }

            // Create API token for the user
            $token = $user->createToken('github-oauth-token')->plainTextToken;

            $payload = [
                'message' => 'Successfully authenticated with GitHub',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'github_id' => $user->github_id,
                ],
                'token' => $token,
            ];

            if ($request->expectsJson()) {
                return response()->json($payload);
            }

            return $this->redirectToFrontend([
                'token' => $token,
                'provider' => 'github',
            ], useFragment: true);
        } catch (\Exception $e) {
            Log::error('GitHub OAuth callback failed', [
                'message' => $e->getMessage(),
            ]);

            return $this->oauthFailure($request, 'Failed to authenticate with GitHub.');
        }
    }

    private function oauthFailure(Request $request, string $message)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
            ], 500);
        }

        return $this->redirectToFrontend([
            'error' => 'github_auth_failed',
            'message' => $message,
        ]);
    }

    private function redirectToFrontend(array $params, bool $useFragment = false)
    {
        $frontendUrl = rtrim((string) config('services.frontend.url'), '/');

        if ($frontendUrl === '') {
            return response()->json($params);
        }

        $callbackPath = '/' . ltrim((string) config('services.frontend.auth_callback_path', '/auth-callback'), '/');
        $separator = $useFragment ? '#' : '?';

        return redirect()->away($frontendUrl . $callbackPath . $separator . http_build_query($params));
    }

    /**
     * Disconnect GitHub account from user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function disconnectGitHub(Request $request)
    {
        try {
            $user = $request->user();

            // Don't allow disconnecting if user has no password (OAuth-only account)
            if (!$user->password) {
                return response()->json([
                    'message' => 'Cannot disconnect GitHub from an OAuth-only account. Please set a password first.'
                ], 400);
            }

            $user->update([
                'github_id' => null,
                'github_token' => null,
                'github_refresh_token' => null,
            ]);

            return response()->json([
                'message' => 'GitHub account disconnected successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to disconnect GitHub account',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

// Made with Bob
