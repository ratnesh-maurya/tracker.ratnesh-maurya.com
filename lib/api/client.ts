// Helper function to handle API responses and redirect on 401
export async function handleApiResponse<T>(response: Response): Promise<T> {
  // Check for 401 Unauthorized
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register or public profile pages
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/u/')) {
        window.location.href = '/login';
        // Return a promise that never resolves to prevent further execution
        return new Promise(() => {});
      }
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

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/u/')) {
        window.location.href = '/login';
      }
    }
  }

  return response;
}
