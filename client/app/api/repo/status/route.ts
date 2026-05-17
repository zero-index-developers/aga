import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function GET(request: Request) {
  const response = await backendFetch('/api/repo/status', {}, request);
  return jsonResponse(response);
}
