<?php

namespace App\Actions\AI;

use App\Models\Node;

class GenerateBlastRadiusAction
{
    public function execute(Node $node): array
    {
        $blastRadius = $node->getBlastRadius();
        $impactSummary = $node->getImpactSummary();

        $formatNode = fn (Node $affectedNode) => [
            'id' => $affectedNode->node_id,
            'name' => $affectedNode->name,
            'type' => $affectedNode->type,
            'layer' => $affectedNode->layer,
            'file_path' => $affectedNode->file_path,
        ];

        $upstreamNodes = Node::query()
            ->where('repository_id', $node->repository_id)
            ->whereIn('node_id', $blastRadius['upstream'])
            ->get()
            ->map($formatNode);

        $downstreamNodes = Node::query()
            ->where('repository_id', $node->repository_id)
            ->whereIn('node_id', $blastRadius['downstream'])
            ->get()
            ->map($formatNode);

        return [
            'node' => [
                'id' => $node->node_id,
                'name' => $node->name,
                'type' => $node->type,
                'layer' => $node->layer,
            ],
            'blast_radius' => [
                'upstream' => $blastRadius['upstream'],
                'downstream' => $blastRadius['downstream'],
                'total' => $blastRadius['total'],
            ],
            'impact_summary' => $impactSummary,
            'affected_nodes' => [
                'upstream' => $upstreamNodes,
                'downstream' => $downstreamNodes,
            ],
        ];
    }
}
