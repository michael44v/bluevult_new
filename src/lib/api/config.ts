// API Configuration
// Change this to your actual backend URL
<<<<<<< HEAD
export const API_BASE_URL = "https://bluevult.com/api/admin-api.php";
=======
export const API_BASE_URL = "http://localhost:80";
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5

// API request helper with error handling
export async function apiRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(API_BASE_URL, {
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
