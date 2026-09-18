const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


async function request(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(options.headers || {}),
      },
    }
  );


  if (!response.ok) {

    let message =
      `API request failed (${response.status})`;

    try {
      const data =
        await response.json();

      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }


  return response.json();
}


export async function getHealth() {
  return request("/health");
}


export async function getModelInfo() {
  return request("/model-info");
}


export async function predictMixing(inputs) {

  return request(
    "/predict",
    {
      method: "POST",

      body: JSON.stringify({
        I1: Number(inputs.I1),
        I2: Number(inputs.I2),
        I3: Number(inputs.I3),
        I4: Number(inputs.I4),
      }),
    }
  );
}