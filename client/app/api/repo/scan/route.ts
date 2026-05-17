import path from "path";

import { backendFetch, jsonResponse } from "@client/lib/backend";
import { scanProject } from "@api/engine/scanner";

export async function POST(request: Request) {
  try {
    const { name, url, provider } = await request.json();
    const startedAt = Date.now();
    const rootPath = path.join(process.cwd(), "..");
    const graph = await scanProject(rootPath);
    const durationMs = Date.now() - startedAt;
    const analytics = {
      nodes: graph.nodes.filter((node) => node.type === "custom").length,
      edges: graph.edges.length,
      health: 98,
      lastScanned: new Date().toISOString(),
    };

    const response = await backendFetch("/api/repositories/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        url: url || "local://aga",
        provider: provider || "local",
        graph,
        analytics,
        duration: `${(durationMs / 1000).toFixed(1)}s`,
        status: "Success",
      }),
    });

    return jsonResponse(response);
  } catch (error) {
    return Response.json({ error: "Scan failed" }, { status: 500 });
  }
}
