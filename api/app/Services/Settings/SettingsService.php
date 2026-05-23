<?php

namespace App\Services\Settings;

use App\Models\AppSetting;

class SettingsService
{
    public function getSettings(): AppSetting
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

    public function update(array $payload): AppSetting
    {
        $settings = $this->getSettings();

        $settings->update([
            'scanner_exclusions' => $payload['scanner']['exclusions'] ?? $settings->scanner_exclusions ?? [],
            'ai_insight_depth' => $payload['ai']['insightDepth'] ?? $settings->ai_insight_depth,
            'ai_focus' => $payload['ai']['focus'] ?? $settings->ai_focus,
        ]);

        return $settings->fresh();
    }

    public function format(AppSetting $settings): array
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
