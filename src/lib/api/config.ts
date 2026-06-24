// API Configuration

export const API_BASE_URL = "https://bluevult.com/api";

// API request helper with error handling
export async function apiRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  // Map endpoint names to their respective PHP files
  const endpointMap: Record<string, string> = {
    admin: "admin-api.php",
    user: "index.php",
    auth: "index.php",
    mail: "mail.php",
  };

  const fileName = endpointMap[endpoint] || endpoint;
  const url = `${API_BASE_URL}/${fileName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
