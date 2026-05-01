// API service layer for device-forecast frontend

const API_BASE = "/api";


export async function uploadExcel(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload-excel`, {
    method: "POST",
    body: formData,
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Server did not return valid JSON. Check backend proxy/API.");
  }
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}


export async function fetchDeviceTypes() {
  const res = await fetch(`${API_BASE}/device-types`);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Server did not return valid JSON. Check backend proxy/API.");
  }
  if (!res.ok) throw new Error(data.error || "Failed to fetch device types");
  return data;
}


export async function requestForecast(deviceCode) {
  const res = await fetch(`${API_BASE}/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceCode }),
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Server did not return valid JSON. Check backend proxy/API.");
  }
  if (!res.ok) throw new Error(data.error || "Forecast failed");
  return data;
}
