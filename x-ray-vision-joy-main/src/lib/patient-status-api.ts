export interface ApiToothFinding {
  tooth_number: string;
  class: string;
}

interface PredictResponse {
  count?: number;
  results?: ApiToothFinding[];
}

const API_BASE_URL = import.meta.env.VITE_DENTAL_API_URL ?? "/api";

export async function analyzeDentalImage(file: File): Promise<ApiToothFinding[]> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Failed to connect to API. Ensure FastAPI is running on http://127.0.0.1:8000 and restart the Vite dev server so /api proxy is active."
    );
  }

  if (!response.ok) {
    let detail = "Failed to analyze uploaded image.";
    try {
      const payload = await response.json();
      if (payload?.detail && typeof payload.detail === "string") {
        detail = payload.detail;
      }
    } catch {
      // Keep default fallback message if response is not JSON.
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as PredictResponse;
  return Array.isArray(data.results) ? data.results : [];
}