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

export async function fetchHeatmap() {
  try {
    const response = await fetch(`${API_URL}/reports/heatmap`);
    if (!response.ok) throw new Error('Failed to fetch heatmap.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function fetchRawReports(token) {
  try {
    const response = await fetch(`${API_URL}/reports`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function verifyReport(id, token) {
  try {
    const response = await fetch(`${API_URL}/reports/${id}/verify`, { 
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

// --- Safety Buddy Endpoints ---

const handleAuthResponse = async (response) => {
  if (response.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return await response.json();
};

export async function fetchNearbyBuddies(location, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/nearby?location=${encodeURIComponent(location)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function fetchMyConnections(token) {
  try {
    const response = await fetch(`${API_URL}/buddies/connections`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function updateUserVisibility(visibility, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ visibility }),
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function updateUserLocation(currentLocation, token) {
  try {
    const response = await fetch(`${API_URL}/profile/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentLocation }),
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function sendBuddyRequest(recipientId, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ recipientId }),
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function respondToBuddyRequest(connectionId, action, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ connectionId, action }),
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function shareBuddyLocation(connectionId, durationHours = 4, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/share-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ connectionId, durationHours }),
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function fetchBuddyMessages(connectionId, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/${connectionId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

export async function sendBuddyMessage(connectionId, text, token) {
  try {
    const response = await fetch(`${API_URL}/buddies/${connectionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ text }), // backend derives senderId from token
    });
    return await handleAuthResponse(response);
  } catch (error) { throw error; }
}

// --- Auth Endpoints ---

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login failed');
  }
  return await response.json();
}

export async function registerUser(email, password, displayName) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Registration failed');
  }
  return await response.json();
}

export async function demoLoginUser() {
  const response = await fetch(`${API_URL}/auth/demo`, { method: 'POST' });
  if (!response.ok) throw new Error('Demo login failed');
  return await response.json();
}
