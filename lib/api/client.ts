import { clearUserData } from '@/lib/query/client';

const PUBLIC_PATHS = ['/login', '/register', '/u/'];

// Session ended: drop this user's cached data before sending them to login, so
// the next person on the device never sees it. Returns true if it redirected.
function redirectToLogin(): boolean {
  if (typeof window === 'undefined') return false;
  const currentPath = window.location.pathname;
  if (PUBLIC_PATHS.some((p) => currentPath.startsWith(p))) return false;
  clearUserData().finally(() => {
    window.location.href = '/login';
  });
  return true;
}

// Helper function to handle API responses and redirect on 401
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (redirectToLogin()) {
      // Never resolves, so callers stop while the redirect happens
      return new Promise(() => {});
    }
    const error: any = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  const data = await response.json();
  if (!data.success) {
    const error: any = new Error(data.error || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return data.data;
}

// Enhanced fetch wrapper that handles 401 errors
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (response.status === 401) redirectToLogin();

  return response;
}
