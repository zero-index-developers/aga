<?php

use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\AIController;
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

// Repository Management Routes
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

// Made with Bob
