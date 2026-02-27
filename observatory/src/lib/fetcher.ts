export async function fetchWithFallback<T>(
  url: string,
  fallback: T,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.warn(`Failed to fetch ${url}, using fallback data`);
    return fallback;
  }
}
