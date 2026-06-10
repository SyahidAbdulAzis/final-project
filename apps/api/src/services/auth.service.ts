import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import type { Role, TokenPurpose } from '../types/auth.type.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

function toPrismaRole(role: Role) {
  return role === 'user' ? 'USER' : 'TENANT';
}

async function findAccount(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
}

async function createToken(email: string, purpose: TokenPurpose) {
  const token = randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + ONE_HOUR_MS);

  await prisma.authToken.create({
    data: {
      email: email.toLowerCase(),
      token,
      purpose: purpose === 'verify' ? 'VERIFICATION' : 'RESET_PASSWORD',
      expiresAt,
      used: false,
    }
  });

  return token;
}

async function validateToken(token: string, purpose: TokenPurpose) {
  const record = await prisma.authToken.findUnique({
    where: { token }
  });
  if (!record) throw new Error('Token tidak valid');
  if (record.used) throw new Error('Token sudah digunakan');
  if (new Date() > record.expiresAt) throw new Error('Token sudah expired');
  const expectedPurpose = purpose === 'verify' ? 'VERIFICATION' : 'RESET_PASSWORD';
  if (record.purpose !== expectedPurpose) throw new Error('Token tidak valid');

  return record;
}

async function invalidateToken(token: string) {
  await prisma.authToken.update({
    where: { token },
    data: { used: true }
  });
}

function hideSecret(account: any) {
  const { passwordHash, ...safe } = account;
  return safe;
}

export async function registerAccount(email: string, role: Role) {
  const existing = await findAccount(email);
  if (existing) throw new Error('Email sudah terdaftar');

  const account = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      role: toPrismaRole(role),
      isVerified: false,
      passwordHash: '',
      fullName: '',
      photoUrl: ''
    }
  });

  return { token: await createToken(email, 'verify'), account: hideSecret(account) };
}

export async function verifyAccount(token: string, password: string) {
  const record = await validateToken(token, 'verify');
  const account = await findAccount(record.email);
  if (!account) throw new Error('Akun tidak ditemukan');

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: account.email },
    data: { isVerified: true, passwordHash }
  });

  await invalidateToken(token);
  const updated = await findAccount(account.email);
  const jwtToken = jwt.sign(
    { id: updated!.id, email: updated!.email, role: updated!.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  return { token: jwtToken, user: hideSecret(updated) };
}

export async function loginAccount(email: string, role: Role, password: string) {
  const account = await findAccount(email);
  if (!account || account.role !== toPrismaRole(role)) throw new Error('Akun tidak ditemukan');
  if (!account.isVerified) throw new Error('Akun belum terverifikasi');
  if (!account.passwordHash) throw new Error('Password belum diatur');

  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) throw new Error('Email atau password salah');

  const token = jwt.sign(
    { id: account.id, email: account.email, role: account.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  return { token, user: hideSecret(account) };
}

export async function resendVerification(email: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  if (account.isVerified) throw new Error('Akun sudah terverifikasi');
  return { token: await createToken(email, 'verify') };
}

export async function requestResetPassword(email: string) {
  const account = await findAccount(email);
  if (!account || !account.isVerified) throw new Error('Akun tidak valid');
  return { token: await createToken(email, 'reset') };
}

export async function resetPassword(token: string, password: string) {
  const record = await validateToken(token, 'reset');
  const account = await findAccount(record.email);
  if (!account) throw new Error('Akun tidak ditemukan');

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: account.email },
    data: { passwordHash }
  });

  await invalidateToken(token);
  return { message: 'Password berhasil direset' };
}

export async function getProfile(email: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  return hideSecret(account);
}

export async function updateProfile(email: string, fullName?: string, photoUrl?: string, newEmail?: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');

  const data: { fullName?: string; photoUrl?: string; email?: string; isVerified?: boolean } = {};
  if (fullName !== undefined) data.fullName = fullName;
  if (photoUrl !== undefined) data.photoUrl = photoUrl;

  let verificationToken: string | null = null;
  if (newEmail && newEmail.toLowerCase() !== account.email.toLowerCase()) {
    const existing = await findAccount(newEmail);
    if (existing) throw new Error('Email sudah digunakan oleh akun lain');
    data.email = newEmail.toLowerCase();
    data.isVerified = false;
    verificationToken = await createToken(newEmail.toLowerCase(), 'verify');
  }

  const updated = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data
  });
  return { ...hideSecret(updated), verificationToken };
}

export async function changePassword(email: string, oldPassword: string, newPassword: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  if (!account.passwordHash) throw new Error('Password belum diatur');

  const valid = await bcrypt.compare(oldPassword, account.passwordHash);
  if (!valid) throw new Error('Password lama tidak cocok');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: account.email },
    data: { passwordHash }
  });
  return hideSecret(await findAccount(account.email));
}
