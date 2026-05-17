import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo") || searchParams.get("name");
  const query = repo ? `?repo=${encodeURIComponent(repo)}` : "";
  const response = await backendFetch(`/api/repositories/graph${query}`);

  return jsonResponse(response);
}
