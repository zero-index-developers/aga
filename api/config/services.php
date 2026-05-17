<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | GitHub API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for GitHub API integration. Used for fetching repository
    | information, cloning repositories, and accessing commit history.
    |
    */

    'github' => [
        'token' => env('GITHUB_TOKEN'),
        'api_url' => env('GITHUB_API_URL', 'https://api.github.com'),
        'storage_path' => env('REPO_STORAGE_PATH', 'app/repositories'),
    ],

    /*
    |--------------------------------------------------------------------------
    | IBM Bob AI Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for IBM Bob AI integration. Used for analyzing code,
    | answering architectural questions, and providing insights.
    |
    */

    'ibm_bob' => [
        'enabled' => env('IBM_BOB_ENABLED', true),
        'api_key' => env('IBM_BOB_API_KEY'),
        'api_url' => env('IBM_BOB_API_URL'),
        'model' => env('IBM_BOB_MODEL', 'ibm/granite-13b-chat-v2'),
        'max_tokens' => env('IBM_BOB_MAX_TOKENS', 2000),
        'temperature' => env('IBM_BOB_TEMPERATURE', 0.7),
        'timeout' => env('IBM_BOB_TIMEOUT', 30),
    ],

];

// Made with Bob
