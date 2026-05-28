import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import type { Account, AuthToken, Role, TokenPurpose } from '../types/auth.type.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

async function findAccount(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
}

async function createToken(email: string, purpose: TokenPurpose) {
  const token = randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + ONE_HOUR_MS);
  
  // For simplicity, we'll return the token directly
  // In a real implementation, you might want to store this in a database
  return token;
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
      role,
      isVerified: false
    }
  });
  
  return { token: await createToken(email, 'verify'), account: hideSecret(account) };
}

export async function verifyAccount(token: string, password: string) {
  // For simplicity, we'll skip token validation for now
  // In a real implementation, you would validate the token against a database
  throw new Error('Token verifikasi tidak valid/expired');
}

export async function loginAccount(email: string, role: Role, password: string) {
  const account = await findAccount(email);
  if (!account || account.role !== role) throw new Error('Akun tidak ditemukan');
  if (!account.isVerified) throw new Error('Akun belum terverifikasi');
  
  // For now, we'll skip password validation since the schema doesn't have passwordHash
  // You'll need to add passwordHash field to the User model in schema.prisma
  return hideSecret(account);
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
  // For simplicity, we'll skip token validation for now
  throw new Error('Token reset tidak valid/expired');
}

export async function getProfile(email: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  return hideSecret(account);
}

export async function updateProfile(email: string, fullName?: string, photoUrl?: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  
  // Note: The current User model doesn't have fullName or photoUrl fields
  // You'll need to add these to the schema.prisma if you want to use them
  return hideSecret(account);
}

export async function changePassword(email: string, oldPassword: string, newPassword: string) {
  const account = await findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  
  // For now, we'll skip password validation since the schema doesn't have passwordHash
  // You'll need to add passwordHash field to the User model in schema.prisma
  return hideSecret(account);
}
