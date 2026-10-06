export type UserRole = 'customer' | 'shop';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  location: string;
  avatarUrl?: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
