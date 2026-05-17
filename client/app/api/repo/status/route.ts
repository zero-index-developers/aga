import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function GET() {
  const response = await backendFetch("/api/repositories/status");

  return jsonResponse(response);
}
