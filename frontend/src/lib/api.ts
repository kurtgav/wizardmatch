const ENV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = ENV_API_URL.endsWith('/api') ? ENV_API_URL.slice(0, -4) : ENV_API_URL;

// Helper function to get auth token from Supabase
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const { supabase } = await import('@/lib/supabase');
    const { data: { session } } = await supabase().auth.getSession();
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
  private questionsCache: any = null;
  private questionsPromise: Promise<{ success: boolean; data: any }> | null = null;

  async getQuestions() {
    if (this.questionsCache) return { success: true, data: this.questionsCache };
    if (this.questionsPromise) return this.questionsPromise;

    this.questionsPromise = this.get<{ success: boolean; data: any }>('/api/survey/questions')
      .then(res => {
        if (res.success) {
          this.questionsCache = res.data;
        }
        this.questionsPromise = null;
        return res;
      })
      .catch(err => {
        this.questionsPromise = null;
        throw err;
      });

    return this.questionsPromise;
  }

  prefetchQuestions() {
    this.getQuestions().catch(() => { });
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
  async getPotentialMatches() {
    return this.get<{ success: boolean; data: any[]; count: number }>(
      '/api/matches/potential'
    );
  }

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

  // NEW: Tinder-style matching
  async passUser(targetUserId: string) {
    return this.post<{ success: boolean; message: string }>(
      `/api/matches/pass/${targetUserId}`
    );
  }

  async interestUser(targetUserId: string) {
    return this.post<{ success: boolean; message: string; matched?: boolean; matchId?: string }>(
      `/api/matches/interest/${targetUserId}`
    );
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

  async getPublicTestimonials() {
    return this.get<{ success: boolean; data: any[] }>('/api/public/testimonials');
  }

  // Admin Testimonial endpoints
  async getAdminTestimonials() {
    return this.get<{ success: boolean; data: any[] }>('/api/admin/testimonials');
  }

  async updateTestimonialStatus(id: string, isApproved: boolean, isPublished: boolean) {
    return this.put<{ success: boolean; data: any; message: string }>(
      `/api/admin/testimonials/${id}`,
      { isApproved, isPublished }
    );
  }
}

export const api = new ApiClient(API_URL);
