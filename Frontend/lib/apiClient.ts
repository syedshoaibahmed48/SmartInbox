export async function fetchFromProxy(path: string, options: RequestInit = {}) {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
    },
    credentials: "include", // so browser sends cookies
  });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch from proxy");
    }

    return res.json();
}