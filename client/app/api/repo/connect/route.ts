import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function POST(request: Request) {
  const response = await backendFetch('/api/repo/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  }, request);

  return jsonResponse(response);
}
