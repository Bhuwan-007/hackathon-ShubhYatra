const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function fetchBriefing(location, travelerType) {
  try {
    const response = await fetch(`${API_URL}/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, travelerType }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch briefing.');
    }
    return await response.json();
  } catch (error) { throw error; }
}

export async function fetchEmergencyPlan(location, landmarks, emergencyType) {
  try {
    const response = await fetch(`${API_URL}/emergency-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, landmarks, emergencyType }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch emergency plan.');
    }
    return await response.json();
  } catch (error) { throw error; }
}

export async function submitHazardReport(formData) {
  try {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      body: formData, // fetch handles multipart/form-data boundary automatically
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit report.');
    }
    return await response.json();
  } catch (error) { throw error; }
}

export async function scanScamImage(formData) {
  try {
    const response = await fetch(`${API_URL}/scan-image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to scan image.');
    }
    return await response.json();
  } catch (error) { throw error; }
}
