export type UserRole = 'customer' | 'shop';

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
  token?: string;
};

export type LoginInput = {
  mobileNumber: string;
  password: string;
};
