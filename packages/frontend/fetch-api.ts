function getUrl(contextUrl: string): string {
  const url = new URL(contextUrl);
  const baseUrl = import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://finviz-assignmentbackend-production.up.railway.app";

  return new URL(`${baseUrl}${url.pathname}${url.search}`).toString();
}

export async function fetchApi<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(getUrl(url), options);
  const data = await response.json();

  return { status: response.status, data } as T;
}
