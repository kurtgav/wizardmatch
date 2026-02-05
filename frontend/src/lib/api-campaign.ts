// Campaign API client functions
// Note: Authentication is handled via JWT token in localStorage

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Helper function to get auth token from Supabase
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
  return null;
}

// Helper function for authenticated API calls
async function fetchAPI(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || response.statusText;
      console.error('API Error:', errorData);
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  return response;
}

// Campaign APIs
export async function getActiveCampaign() {
  const response = await fetchAPI(`${API_URL}/campaigns/active`);
  if (!response.ok) throw new Error('Failed to get active campaign');
  return response.json();
}

export async function getCampaigns() {
  const response = await fetchAPI(`${API_URL}/campaigns`);
  if (!response.ok) throw new Error('Failed to fetch campaigns');
  return response.json();
}

export async function getCampaignStats(campaignId: string) {
  const response = await fetchAPI(`${API_URL}/campaigns/${campaignId}/stats`);
  if (!response.ok) throw new Error('Failed to get campaign stats');
  return response.json();
}

export async function createCampaign(data: any) {
  const response = await fetchAPI(`${API_URL}/campaigns`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create campaign');
  return response.json();
}

export async function updateCampaign(id: string, data: any) {
  const response = await fetchAPI(`${API_URL}/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update campaign');
  return response.json();
}

export async function deleteCampaign(id: string) {
  const response = await fetchAPI(`${API_URL}/campaigns/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete campaign');
  return response.json();
}

export async function updateCampaignStats(id: string, data: any) {
  // Note: This endpoint might not exist in backend handlers yet as public API, usually internal.
  // But checking campaigns.sql it has UpdateCampaignStats.
  // Handlers didn't expose it explicitly, but `UpdateCampaign` can update config/etc.
  // Real stats update usually happens via internal triggers or matching service.
  // I'll leave this out or implement if needed. For now the UI uses getCampaignStats which is read-only.
  // The previous code in AdminCampaignsPage calls loadStats -> getCampaignStats.
  // It doesn't call updateCampaignStats.
  return Promise.resolve();
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
  username?: string;
  bio?: string;
  profilePhotoUrl?: string;
  instagramHandle?: string;
  facebookProfile?: string;
  program?: string;
  yearLevel?: number;
  gender?: string;
  seekingGender?: string;
  firstName?: string;
  lastName?: string;
  socialMediaName?: string;
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
