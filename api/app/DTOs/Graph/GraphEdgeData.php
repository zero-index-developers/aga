<?php

namespace App\DTOs\Graph;

readonly class GraphEdgeData
{
    public function __construct(
        public string $id,
        public string $source,
        public string $target,
        public ?string $type = null,
    ) {}
}
