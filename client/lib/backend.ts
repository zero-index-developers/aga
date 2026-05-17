function backendBaseUrl() {
  return (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/+$/, "");
}

function authHeaderFrom(request?: Request): string | null {
  const authorization = request?.headers.get("authorization");

  if (authorization) {
    return authorization;
  }

  const cookieHeader = request?.headers.get("cookie") || "";
  const authCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("auth_token="));

  if (!authCookie) {
    return null;
  }

  return `Bearer ${decodeURIComponent(authCookie.split("=").slice(1).join("="))}`;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
  incomingRequest?: Request,
) {
  const baseUrl = backendBaseUrl();

  if (!baseUrl) {
    throw new Error("Laravel API URL is not configured");
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", headers.get("Accept") || "application/json");

  const authorization = authHeaderFrom(incomingRequest);
  if (authorization && !headers.has("Authorization")) {
    headers.set("Authorization", authorization);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
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
