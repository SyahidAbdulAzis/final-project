import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadImage } from '../utils/cloudinary.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const uploadRouter = Router();

uploadRouter.post('/upload', verifyToken as any, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });
    const result = await uploadImage(req.file.buffer);
    return res.json({ url: result.secureUrl });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
});

export { uploadRouter };
