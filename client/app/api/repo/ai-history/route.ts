import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function GET() {
  const response = await backendFetch("/api/ai-history");

  return jsonResponse(response);
}

export async function DELETE(request: Request) {
  const body = await request.text();
  const response = await backendFetch("/api/ai-history", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return jsonResponse(response);
}
