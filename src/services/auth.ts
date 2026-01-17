import api from '@/lib/api';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student';
};

export async function register(data: { name: string; email: string; password: string; registrationNo: string }) {
  const res = await api.post('/api/v1/student/register', data);
  return res.data as { success: boolean; data: User; token: string };
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/api/v1/auth/login', data);
  return res.data as { success: boolean; data: User; token: string };
}

export async function me() {
  const res = await api.get('/api/v1/auth/me');
  return res.data as { success: boolean; data: User };
}
