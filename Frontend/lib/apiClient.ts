export async function apiClient(path: string, options: RequestInit = {}, useProxy: boolean = true) {
    
  // Determine the base URL
  const url = useProxy ? path : `${process.env.API_URL}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
      ...options.headers,
      "Content-Type": "application/json",
      ...(useProxy ? {} : { Authorization: `Bearer ${process.env.API_KEY}` }),
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      if (process.env.NODE_ENV === "development") {
        console.error(`API Client Error: \nEndpoint: ${url}\nMethod: ${options.method}\nStatus: ${res.status} ${errorData.message}`);
      }
      if (res.status === 400) throw { message: errorData.message || "Bad Request", status: 400 };
      else if (res.status === 401) throw { message: "Unauthorized access", status: 401 };
      else if (res.status === 500) throw { message: "Internal server error, please try again later.", status: 500 };
      else{
        throw { message: "An unexpected error occurred", status: 500 };
      }
    }

    return res.json();
}