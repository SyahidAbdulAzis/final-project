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

export async function uploadImage(buffer: Buffer): Promise<UploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials not configured');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'stayease' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secureUrl: result!.secure_url, publicId: result!.public_id });
      },
    );
    stream.end(buffer);
  });
}
