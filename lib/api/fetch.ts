import { redirect } from 'next/navigation';

// Custom fetch wrapper that handles 401 errors globally
export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
  });

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    // Only redirect if we're in the browser and not already on login/register page
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return response;
  }

  return response;
}

