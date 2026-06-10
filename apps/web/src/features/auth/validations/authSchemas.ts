import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  role: z.enum(['user', 'tenant']).refine((val) => val !== undefined, { message: 'Pilih role' }),
});

export const verifySchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export const forgotSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

export const resetSchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export const profileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional(),
  photo: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      { message: 'Ukuran foto maksimal 1MB' }
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ALLOWED_EXTENSIONS.some((ext) =>
          files[0].name.toLowerCase().endsWith(ext)
        ),
      { message: 'Format foto harus JPG, PNG, atau GIF' }
    ),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmNewPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Password tidak cocok',
  path: ['confirmNewPassword'],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type VerifyForm = z.infer<typeof verifySchema>;
export type ForgotForm = z.infer<typeof forgotSchema>;
export type ResetForm = z.infer<typeof resetSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
