export type UserRole = 'customer' | 'shop';

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
};

export type LoginInput = {
  mobileNumber: string;
};
