<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json($this->formatSettings($this->settingsRecord()));
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'scanner' => ['nullable', 'array'],
            'scanner.exclusions' => ['nullable', 'array'],
            'scanner.exclusions.*' => ['string'],
            'ai' => ['nullable', 'array'],
            'ai.insightDepth' => ['nullable', 'in:concise,detailed'],
            'ai.focus' => ['nullable', 'in:architecture,security,performance'],
        ]);

        $settings = $this->settingsRecord();

        $settings->update([
            'scanner_exclusions' => $payload['scanner']['exclusions'] ?? $settings->scanner_exclusions ?? [],
            'ai_insight_depth' => $payload['ai']['insightDepth'] ?? $settings->ai_insight_depth,
            'ai_focus' => $payload['ai']['focus'] ?? $settings->ai_focus,
        ]);

        return response()->json([
            'success' => true,
            'settings' => $this->formatSettings($settings->fresh()),
        ]);
    }

    private function settingsRecord(): AppSetting
    {
        return AppSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'scanner_exclusions' => [],
                'ai_insight_depth' => 'concise',
                'ai_focus' => 'architecture',
            ],
        );
    }

    private function formatSettings(AppSetting $settings): array
    {
        return [
            'scanner' => [
                'exclusions' => $settings->scanner_exclusions ?? [],
            ],
            'ai' => [
                'insightDepth' => $settings->ai_insight_depth,
                'focus' => $settings->ai_focus,
            ],
        ];
    }
}
