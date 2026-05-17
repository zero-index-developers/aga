import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function GET(request: Request) {
  const response = await backendFetch('/api/repo/ai-history', {}, request);
  return jsonResponse(response);
}

export async function DELETE(request: Request) {
  const response = await backendFetch('/api/repo/ai-history', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  }, request);

  return jsonResponse(response);
}
