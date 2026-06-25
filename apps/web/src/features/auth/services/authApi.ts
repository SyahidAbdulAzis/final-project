import { apiClient } from '../../../lib/axios.js';

export async function registerApi(email: string, role: 'user' | 'tenant') {
  const { data } = await apiClient.post(`/auth/register/${role}`, { email });
  return data;
}

export async function verifyApi(token: string, password: string) {
  const { data } = await apiClient.post('/auth/verify', { token, password });
  return data;
}

export async function loginApi(email: string, password: string, role: 'user' | 'tenant') {
  const { data } = await apiClient.post(`/auth/login/${role}`, { email, password });
  return data;
}

export async function resendVerificationApi(email: string) {
  const { data } = await apiClient.post('/auth/resend-verification', { email });
  return data;
}

export async function forgotPasswordApi(email: string) {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPasswordApi(token: string, password: string) {
  const { data } = await apiClient.post('/auth/reset-password', { token, password });
  return data;
}

export async function getProfileApi(email: string) {
  const { data } = await apiClient.get(`/auth/profile/${email}`);
  return data;
}

export async function updateProfileApi(email: string, fullName?: string, photoUrl?: string, newEmail?: string) {
  const { data } = await apiClient.patch(`/auth/profile/${email}`, { fullName, photoUrl, email: newEmail });
  return data;
}

export async function changePasswordApi(email: string, oldPassword: string, newPassword: string) {
  const { data } = await apiClient.patch(`/auth/profile/${email}/password`, {
    oldPassword,
    newPassword,
  });
  return data;
}
