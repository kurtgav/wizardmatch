// Campaign API client functions
// Note: Authentication is handled via NextAuth cookies

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function for authenticated API calls
async function fetchAPI(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for NextAuth session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// Campaign APIs
export async function getActiveCampaign() {
  const response = await fetchAPI(`${API_URL}/campaigns/active`);
  if (!response.ok) throw new Error('Failed to get active campaign');
  return response.json();
}

export async function getCampaignStats(campaignId: string) {
  const response = await fetchAPI(`${API_URL}/campaigns/${campaignId}/stats`);
  if (!response.ok) throw new Error('Failed to get campaign stats');
  return response.json();
}

export async function checkActionAllowed(action: string) {
  const response = await fetchAPI(`${API_URL}/campaigns/active/check-action/${action}`);
  if (!response.ok) throw new Error('Failed to check action permission');
  return response.json();
}

// Crush List APIs
export async function submitCrushList(crushes: Array<{ email: string; name?: string }>) {
  const response = await fetchAPI(`${API_URL}/crush-list`, {
    method: 'POST',
    body: JSON.stringify({ crushes }),
  });
  if (!response.ok) throw new Error('Failed to submit crush list');
  return response.json();
}

export async function getCrushList() {
  const response = await fetchAPI(`${API_URL}/crush-list`);
  if (!response.ok) throw new Error('Failed to get crush list');
  return response.json();
}

export async function updateCrushList(crushes: Array<{ email: string; name?: string }>) {
  const response = await fetchAPI(`${API_URL}/crush-list`, {
    method: 'PUT',
    body: JSON.stringify({ crushes }),
  });
  if (!response.ok) throw new Error('Failed to update crush list');
  return response.json();
}

export async function getMutualCrushes() {
  const response = await fetchAPI(`${API_URL}/crush-list/mutual`);
  if (!response.ok) throw new Error('Failed to get mutual crushes');
  return response.json();
}

export async function getCrushedBy() {
  const response = await fetchAPI(`${API_URL}/crush-list/crushed-by`);
  if (!response.ok) throw new Error('Failed to get crushed by list');
  return response.json();
}

// Messaging APIs
export async function getConversations() {
  const response = await fetchAPI(`${API_URL}/messages/conversations`);
  if (!response.ok) throw new Error('Failed to get conversations');
  return response.json();
}

export async function getMessages(matchId: string) {
  const response = await fetchAPI(`${API_URL}/messages/${matchId}`);
  if (!response.ok) throw new Error('Failed to get messages');
  return response.json();
}

export async function sendMessage(matchId: string, content: string) {
  const response = await fetchAPI(`${API_URL}/messages/send/${matchId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function markMessagesAsRead(messageIds: string[]) {
  const response = await fetchAPI(`${API_URL}/messages/read`, {
    method: 'PUT',
    body: JSON.stringify({ messageIds }),
  });
  if (!response.ok) throw new Error('Failed to mark messages as read');
  return response.json();
}

export async function getUnreadCount() {
  const response = await fetchAPI(`${API_URL}/messages/unread-count`);
  if (!response.ok) throw new Error('Failed to get unread count');
  return response.json();
}

// Profile APIs
export async function updateProfile(data: {
  bio?: string;
  profilePhotoUrl?: string;
  instagramHandle?: string;
  phoneNumber?: string;
  contactPreference?: string;
  profileVisibility?: string;
}) {
  const response = await fetchAPI(`${API_URL}/users/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}
