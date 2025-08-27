export async function apiClient(path: string, options: RequestInit = {}, useProxy: boolean = true) {
    // Determine the base URL
    let url = path;
    if (!useProxy) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      url = backendUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
    }

    const res = await fetch(url, {
      ...options,
      headers: {
      ...options.headers,
      "Content-Type": "application/json",
      }
    });

    if (!res.ok) {
      const errorData = await res.json();// Dev: temporary log
      console.error("Error during API call:", errorData);// Dev: temporary log
      throw new Error("Failed to fetch");
    }

    return res.json();
}