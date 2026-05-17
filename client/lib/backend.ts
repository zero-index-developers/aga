const DEFAULT_API_URL = "http://127.0.0.1:8000";

function backendBaseUrl() {
  return (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/+$/, "");
}

export async function backendFetch(
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  return response;
}

export async function jsonResponse(response: Response) {
  const text = await response.text();

  return new Response(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json",
    },
  });
}
