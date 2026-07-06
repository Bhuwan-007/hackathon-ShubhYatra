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

export async function fetchRawReports() {
  try {
    const response = await fetch(`${API_URL}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function verifyReport(id) {
  try {
    const response = await fetch(`${API_URL}/reports/${id}/verify`, { method: 'PATCH' });
    if (!response.ok) throw new Error('Failed to verify report.');
    return await response.json();
  } catch (error) { throw error; }
}

// --- Safety Buddy Endpoints ---

export async function fetchNearbyBuddies(location, userId) {
  try {
    const response = await fetch(`${API_URL}/buddies/nearby?location=${encodeURIComponent(location)}&userId=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error('Failed to fetch nearby buddies.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function fetchMyConnections(userId) {
  try {
    const response = await fetch(`${API_URL}/buddies/connections?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error('Failed to fetch connections.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function updateUserVisibility(userId, visibility) {
  try {
    const response = await fetch(`${API_URL}/buddies/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, visibility }),
    });
    if (!response.ok) throw new Error('Failed to update visibility.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function sendBuddyRequest(requesterId, recipientId) {
  try {
    const response = await fetch(`${API_URL}/buddies/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId, recipientId }),
    });
    if (!response.ok) throw new Error('Failed to send buddy request.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function respondToBuddyRequest(connectionId, action) {
  try {
    const response = await fetch(`${API_URL}/buddies/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, action }),
    });
    if (!response.ok) throw new Error('Failed to respond to request.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function shareBuddyLocation(connectionId, durationHours = 4) {
  try {
    const response = await fetch(`${API_URL}/buddies/share-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, durationHours }),
    });
    if (!response.ok) throw new Error('Failed to share location.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function fetchBuddyMessages(connectionId) {
  try {
    const response = await fetch(`${API_URL}/buddies/${connectionId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages.');
    return await response.json();
  } catch (error) { throw error; }
}

export async function sendBuddyMessage(connectionId, senderId, text) {
  try {
    const response = await fetch(`${API_URL}/buddies/${connectionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, text }),
    });
    if (!response.ok) throw new Error('Failed to send message.');
    return await response.json();
  } catch (error) { throw error; }
}
