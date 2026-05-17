import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function GET(request: Request) {
  const response = await backendFetch('/api/repo/logs', {}, request);
  return jsonResponse(response);
}

export async function DELETE(request: Request) {
  const response = await backendFetch('/api/repo/logs', {
    method: 'DELETE',
  }, request);

  return jsonResponse(response);
}
