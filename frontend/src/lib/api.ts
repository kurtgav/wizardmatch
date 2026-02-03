const ENV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = ENV_API_URL.endsWith('/api') ? ENV_API_URL.slice(0, -4) : ENV_API_URL;

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Helper function for authenticated API calls
async function fetchAPI(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetchAPI(url, options || {});

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'An unknown error occurred',
      }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async getSession() {
    return this.get<{ success: boolean; data: any }>('/api/auth/session');
  }

  // User endpoints
  async getProfile() {
    return this.get<{ success: boolean; data: any }>('/api/users/profile');
  }

  async updateProfile(data: any) {
    return this.put('/api/users/profile', data);
  }

  // Survey endpoints
  async getQuestions() {
    return this.get<{ success: boolean; data: any }>('/api/survey/questions');
  }

  async submitResponse(data: any) {
    return this.post('/api/survey/responses', data);
  }

  async getProgress() {
    return this.get<{ success: boolean; data: any }>('/api/survey/progress');
  }

  async getResponses() {
    return this.get<{ success: boolean; data: any[] }>('/api/survey/responses');
  }

  async completeSurvey() {
    return this.post('/api/survey/complete');
  }

  // Match endpoints
  async getMatches() {
    return this.get<{ success: boolean; data: any[]; count: number }>(
      '/api/matches'
    );
  }

  async getMatch(matchId: string) {
    return this.get<{ success: boolean; data: any }>(`/api/matches/${matchId}`);
  }

  async revealMatch(matchId: string) {
    return this.post(`/api/matches/${matchId}/reveal`);
  }

  async markInterest(matchId: string, interested: boolean) {
    return this.post(`/api/matches/${matchId}/interest`, { interested });
  }

  // Analytics endpoints
  async getOverview() {
    return this.get<{ success: boolean; data: any }>('/api/analytics/overview');
  }

  async getByProgram() {
    return this.get<{ success: boolean; data: any[] }>(
      '/api/analytics/programs'
    );
  }

  async getByYearLevel() {
    return this.get<{ success: boolean; data: any[] }>(
      '/api/analytics/year-levels'
    );
  }

  // Testimonial endpoint (public)
  async submitTestimonial(data: {
    authorName: string;
    program?: string;
    title?: string;
    content: string;
  }) {
    return this.post<{ success: boolean; data: any; message: string }>(
      '/api/public/testimonials',
      data
    );
  }
}

export const api = new ApiClient(API_URL);
