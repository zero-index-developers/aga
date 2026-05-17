import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function GET() {
  const response = await backendFetch("/api/scan-logs");

  return jsonResponse(response);
}

export async function DELETE() {
  const response = await backendFetch("/api/scan-logs", {
    method: "DELETE",
  });

  return jsonResponse(response);
}
