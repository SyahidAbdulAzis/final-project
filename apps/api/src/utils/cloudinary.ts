export type UploadResult = {
  secureUrl: string;
  publicId: string;
};

export async function uploadImage(_filePath: string): Promise<UploadResult> {
  return Promise.resolve({ secureUrl: '', publicId: '' });
}
