<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSettingsRequest;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(
            $this->settingsService->format($this->settingsService->getSettings())
        );
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $settings = $this->settingsService->update($request->validated());

        return response()->json([
            'success' => true,
            'settings' => $this->settingsService->format($settings),
        ]);
    }
}
