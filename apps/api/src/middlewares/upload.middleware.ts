import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.'));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});
