export interface BackendUser {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  photoUrl?: string;
  avatar?: string;
  isVerified?: boolean;
}

export function mapBackendUser(raw: BackendUser, fallbackRole: 'user' | 'tenant' = 'user') {
  return {
    id: raw.id ?? '',
    name: raw.fullName ?? raw.name ?? '',
    email: raw.email ?? '',
    role: (raw.role?.toLowerCase() ?? fallbackRole) as 'user' | 'tenant',
    avatar: raw.photoUrl ?? raw.avatar ?? undefined,
    isVerified: raw.isVerified ?? false,
  };
}
