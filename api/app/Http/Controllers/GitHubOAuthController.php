<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            $url = Socialite::driver('github')
                ->scopes(['user:email', 'read:user', 'repo'])
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'url' => $url
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate GitHub OAuth URL',
                'error' => $e->getMessage()
            ], 500);
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
            // Get the GitHub user
            $githubUser = Socialite::driver('github')
                ->stateless()
                ->user();

            // Find or create user
            $user = User::where('github_id', $githubUser->getId())->first();

            if ($user) {
                // Update existing user's GitHub token and avatar
                $user->update([
                    'github_token' => $githubUser->token,
                    'github_refresh_token' => $githubUser->refreshToken,
                    'avatar' => $githubUser->getAvatar(),
                ]);
            } else {
                // Check if user exists with this email
                $user = User::where('email', $githubUser->getEmail())->first();

                if ($user) {
                    // Link GitHub account to existing user
                    $user->update([
                        'github_id' => $githubUser->getId(),
                        'github_token' => $githubUser->token,
                        'github_refresh_token' => $githubUser->refreshToken,
                        'avatar' => $githubUser->getAvatar(),
                    ]);
                } else {
                    // Create new user
                    $user = User::create([
                        'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                        'email' => $githubUser->getEmail(),
                        'github_id' => $githubUser->getId(),
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

            return response()->json([
                'message' => 'Successfully authenticated with GitHub',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'github_id' => $user->github_id,
                ],
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to authenticate with GitHub',
                'error' => $e->getMessage()
            ], 500);
        }
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
