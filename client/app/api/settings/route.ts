import { backendFetch, jsonResponse } from '@client/lib/backend';

export async function GET(request: Request) {
  const response = await backendFetch('/api/settings', {}, request);
  return jsonResponse(response);
}

export async function POST(request: Request) {
  const response = await backendFetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  }, request);

  return jsonResponse(response);
}
