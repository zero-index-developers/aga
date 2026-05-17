import path from 'path';
import { scanProject } from '@api/engine/scanner';
import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function POST(request: Request) {
  try {
    const startedAt = Date.now();
    const { name, url, provider } = await request.json();
    const rootPath = path.join(process.cwd(), '..'); // Scanner still lives in the Next workspace.

    const graph = await scanProject(rootPath);
    const analytics = {
      nodes: graph.nodes.filter((node: any) => node.type === 'custom').length,
      edges: graph.edges.length,
      health: 98,
      lastScanned: new Date().toISOString(),
    };
    const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);

    const response = await backendFetch('/api/repo/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        url: url || 'local://aga',
        provider,
        graph,
        analytics,
        duration: `${durationSeconds}s`,
        status: 'Success',
      }),
    }, request);

    return jsonResponse(response);
  } catch (error) {
    console.error('Scan failed:', error);

    const fallbackPayload = {
      success: false,
      error: 'Scan failed',
    };

    return Response.json(fallbackPayload, { status: 500 });
  }
}
