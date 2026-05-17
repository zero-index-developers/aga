import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await backendFetch("/api/repositories/connect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return jsonResponse(response);
}
