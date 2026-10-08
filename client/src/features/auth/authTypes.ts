export type UserRole = 'customer' | 'shop';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  location: string;
  avatarUrl?: string;
  phoneNumber?: string;
  pickupTime?: string;
  pickupInstructions?: string;
  allowCalls?: boolean;
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

export type RegistrationResponse = {
  email: string;
  message: string;
  developmentCode?: string;
};

export type ShopRegistrationInput = {
  ownerName: string;
  email: string;
  storeName: string;
  category: string;
  address: string;
  mobile: string;
};
