import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const response = await backendFetch(`/api/repo/graph${search}`, {}, request);
  return jsonResponse(response);
}
