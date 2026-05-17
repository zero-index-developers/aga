import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function GET(request: Request) {
  const response = await backendFetch('/api/repo/list', {}, request);
  return jsonResponse(response);
}
