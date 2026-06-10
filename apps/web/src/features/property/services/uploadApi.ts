import { apiClient } from '../../../lib/axios.js';

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post('/upload', formData);
  return data.url as string;
}
