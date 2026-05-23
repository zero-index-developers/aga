<?php

namespace App\DTOs\Graph;

readonly class GraphNodeData
{
    public function __construct(
        public string $id,
        public string $label,
        public string $type,
        public string $layer,
        public ?string $filePath = null,
    ) {}
}
