export type Role = 'user' | 'tenant';

export type Account = {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  photoUrl: string;
  passwordHash: string | null;
  isVerified: boolean;
  createdAt: number;
};

export type TokenPurpose = 'verify' | 'reset';

export type AuthToken = {
  token: string;
  email: string;
  purpose: TokenPurpose;
  expiresAt: number;
  used: boolean;
};
