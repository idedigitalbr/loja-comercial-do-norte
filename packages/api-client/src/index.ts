import { ApiErrorSchema } from '@commerce/contracts';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const parsedError = ApiErrorSchema.safeParse(payload);
    if (parsedError.success) {
      throw parsedError.data;
    }

    throw new Error(`API request failed with status ${response.status}`);
  }

  return payload as T;
}
