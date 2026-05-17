import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function GET() {
  const response = await backendFetch("/api/settings");

  return jsonResponse(response);
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await backendFetch("/api/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return jsonResponse(response);
}
