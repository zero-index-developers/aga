<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\OAuth\GitHubOAuthController;
use App\Http\Controllers\Api\RepositoryManagementController;
use App\Http\Controllers\Api\AIController;
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
        Route::get('/', [RepositoryManagementController::class, 'index']);
        Route::post('/connect', [RepositoryManagementController::class, 'connect']);
        Route::get('/{id}', [RepositoryManagementController::class, 'show']);
        Route::get('/{id}/status', [RepositoryManagementController::class, 'status']);
        Route::get('/{id}/graph', [RepositoryManagementController::class, 'graph']);
        Route::post('/{id}/rescan', [RepositoryManagementController::class, 'rescan']);
        Route::delete('/{id}', [RepositoryManagementController::class, 'destroy']);
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
