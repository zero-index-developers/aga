<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\GitHubOAuthController;
use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\Api\AiHistoryController;
use App\Http\Controllers\Api\RepositoryController as FrontendRepositoryController;
use App\Http\Controllers\Api\ScanLogController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication Routes (Public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
    
    // GitHub OAuth Routes
    Route::get('/github', [GitHubOAuthController::class, 'redirectToGitHub']);
    Route::get('/github/callback', [GitHubOAuthController::class, 'handleGitHubCallback']);
});

// Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/github/disconnect', [GitHubOAuthController::class, 'disconnectGitHub']);
    });

    // Repository Management Routes
    Route::prefix('repo')->group(function () {
        Route::get('/list', [FrontendRepositoryController::class, 'index']);
        Route::get('/status', [FrontendRepositoryController::class, 'status']);
        Route::post('/connect', [FrontendRepositoryController::class, 'connect']);
        Route::get('/graph', [FrontendRepositoryController::class, 'graph']);
        Route::post('/scan', [FrontendRepositoryController::class, 'storeScan']);
        Route::get('/logs', [ScanLogController::class, 'index']);
        Route::delete('/logs', [ScanLogController::class, 'destroyAll']);
        Route::get('/ai-history', [AiHistoryController::class, 'index']);
        Route::delete('/ai-history', [AiHistoryController::class, 'destroyMany']);
    });

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::post('/settings', [SettingsController::class, 'update']);

    Route::prefix('repositories')->group(function () {
        Route::get('/', [RepositoryController::class, 'index']);
        Route::post('/connect', [RepositoryController::class, 'connect']);
        Route::get('/{id}', [RepositoryController::class, 'show']);
        Route::get('/{id}/status', [RepositoryController::class, 'status']);
        Route::get('/{id}/graph', [RepositoryController::class, 'graph']);
        Route::post('/{id}/rescan', [RepositoryController::class, 'rescan']);
        Route::delete('/{id}', [RepositoryController::class, 'destroy']);
    });

    // AI Oracle Routes
    Route::prefix('ai')->group(function () {
        Route::get('/status', [AIController::class, 'status']);
        Route::post('/query', [AIController::class, 'query']);
        Route::post('/blast-radius', [AIController::class, 'blastRadius']);
        Route::get('/history/{repositoryId}', [AIController::class, 'history']);
    });
});

// Made with Bob
