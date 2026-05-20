import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Account, AuthToken, Role, TokenPurpose } from '../types/auth.type.js';

const ONE_HOUR_MS = 60 * 60 * 1000;
const accounts: Account[] = [];
const tokens: AuthToken[] = [];

function findAccount(email: string) {
  return accounts.find((x) => x.email.toLowerCase() === email.toLowerCase());
}

function createToken(email: string, purpose: TokenPurpose) {
  const record: AuthToken = {
    token: randomUUID().replace(/-/g, ''),
    email,
    purpose,
    expiresAt: Date.now() + ONE_HOUR_MS,
    used: false,
  };
  tokens.push(record);
  return record.token;
}

function findValidToken(token: string, purpose: TokenPurpose) {
  return tokens.find((x) => x.token === token && x.purpose === purpose && !x.used && x.expiresAt > Date.now());
}

function hideSecret(account: Account) {
  const { passwordHash, ...safe } = account;
  return safe;
}

export function registerAccount(email: string, role: Role) {
  if (findAccount(email)) throw new Error('Email sudah terdaftar');
  const account: Account = {
    id: randomUUID(),
    email,
    role,
    fullName: '',
    photoUrl: '',
    passwordHash: '',
    isVerified: false,
    createdAt: Date.now(),
  };
  accounts.push(account);
  return { token: createToken(email, 'verify'), account: hideSecret(account) };
}

export async function verifyAccount(token: string, password: string) {
  const record = findValidToken(token, 'verify');
  if (!record) throw new Error('Token verifikasi tidak valid/expired');
  const account = findAccount(record.email);
  if (!account) throw new Error('Akun tidak ditemukan');
  account.passwordHash = await bcrypt.hash(password, 10);
  account.isVerified = true;
  record.used = true;
  return hideSecret(account);
}

export async function loginAccount(email: string, role: Role, password: string) {
  const account = findAccount(email);
  if (!account || account.role !== role) throw new Error('Akun tidak ditemukan');
  if (!account.isVerified) throw new Error('Akun belum terverifikasi');
  const matched = await bcrypt.compare(password, account.passwordHash);
  if (!matched) throw new Error('Password salah');
  return hideSecret(account);
}

export function resendVerification(email: string) {
  const account = findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  if (account.isVerified) throw new Error('Akun sudah terverifikasi');
  return { token: createToken(email, 'verify') };
}

export function requestResetPassword(email: string) {
  const account = findAccount(email);
  if (!account || !account.isVerified) throw new Error('Akun tidak valid');
  return { token: createToken(email, 'reset') };
}

export async function resetPassword(token: string, password: string) {
  const record = findValidToken(token, 'reset');
  if (!record) throw new Error('Token reset tidak valid/expired');
  const account = findAccount(record.email);
  if (!account) throw new Error('Akun tidak ditemukan');
  account.passwordHash = await bcrypt.hash(password, 10);
  record.used = true;
  return hideSecret(account);
}

export function getProfile(email: string) {
  const account = findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  return hideSecret(account);
}

export function updateProfile(email: string, fullName?: string, photoUrl?: string) {
  const account = findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  if (fullName) account.fullName = fullName;
  if (photoUrl) account.photoUrl = photoUrl;
  return hideSecret(account);
}

export async function changePassword(email: string, oldPassword: string, newPassword: string) {
  const account = findAccount(email);
  if (!account) throw new Error('Akun tidak ditemukan');
  const matched = await bcrypt.compare(oldPassword, account.passwordHash);
  if (!matched) throw new Error('Password lama salah');
  account.passwordHash = await bcrypt.hash(newPassword, 10);
  return hideSecret(account);
}
