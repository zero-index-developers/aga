<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = [
        'scanner_exclusions',
        'ai_insight_depth',
        'ai_focus',
    ];

    protected $casts = [
        'scanner_exclusions' => 'array',
    ];
}
