import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export type UploadResult = {
  secureUrl: string;
  publicId: string;
};

export async function uploadImage(filePath: string): Promise<UploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials not configured');
  }
  const result = await cloudinary.uploader.upload(filePath, { folder: 'stayease' });
  return { secureUrl: result.secure_url, publicId: result.public_id };
}
