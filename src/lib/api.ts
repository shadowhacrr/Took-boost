const API_BASE = '';

function getToken(): string | null {
  return localStorage.getItem('tokboost_token');
}

function getAdminToken(): string | null {
  return localStorage.getItem('tokboost_admin_token');
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken() || getAdminToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || err.error || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const api = {
  owner: {
    login: (username: string, password: string) =>
      fetchJson<{ success: boolean; token?: string; message?: string }>('/api/owner/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    info: () => fetchJson<{ username: string; whatsapp: string }>('/api/owner/info'),
    update: (data: { username?: string; password?: string; whatsapp?: string }) =>
      fetchJson<{ success: boolean }>('/api/owner/update', { method: 'PUT', body: JSON.stringify(data) }),
    orders: () => fetchJson<any[]>('/api/owner/orders'),
  },
  admin: {
    login: (username: string, password: string) =>
      fetchJson<{ success: boolean; token?: string; admin?: any; message?: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    info: () => fetchJson<any>('/api/admin/info'),
    updateWallet: (data: { walletType: string; walletNumber: string; walletName: string }) =>
      fetchJson<{ success: boolean }>('/api/admin/wallet', { method: 'PUT', body: JSON.stringify(data) }),
    refreshLink: () =>
      fetchJson<{ success: boolean; userLink?: string }>('/api/admin/refresh-link', { method: 'POST' }),
    orders: () => fetchJson<any[]>('/api/admin/orders'),
  },
  admins: {
    list: () => fetchJson<any[]>('/api/admins'),
    create: (data: { username: string; password: string }) =>
      fetchJson<{ success: boolean; admin?: any; message?: string }>('/api/admins', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => fetchJson<{ success: boolean }>(`/api/admins/${id}`, { method: 'DELETE' }),
  },
  pricing: {
    get: () => fetchJson<{ followers: number; likes: number; comments: number; views: number; shares: number }>('/api/pricing'),
    update: (data: any) => fetchJson<{ success: boolean }>('/api/pricing', { method: 'PUT', body: JSON.stringify(data) }),
  },
  orders: {
    create: (data: any) => fetchJson<{ success: boolean; order?: any }>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    status: (id: string) => fetchJson<any>(`/api/orders/${id}/status`),
    complete: (id: string) => fetchJson<{ success: boolean }>(`/api/orders/${id}/complete`, { method: 'PUT' }),
  },
  complaints: {
    list: () => fetchJson<any[]>('/api/complaints'),
    create: (data: { name: string; email: string; message: string }) =>
      fetchJson<{ success: boolean }>('/api/complaints', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => fetchJson<{ success: boolean }>(`/api/complaints/${id}`, { method: 'DELETE' }),
  },
  reviews: {
    list: () => fetchJson<any[]>('/api/reviews'),
    create: (data: { adminId: string; rating: number; comment: string }) =>
      fetchJson<{ success: boolean }>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },
  activity: {
    list: () => fetchJson<any[]>('/api/activity'),
  },
  stats: {
    get: () => fetchJson<any>('/api/stats'),
  },
  public: {
    adminByLink: (link: string) => fetchJson<any>(`/api/admin/by-link/${link}`),
  },
};
