import { Redirect, Stack } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function ShopLayout() {
  const { user } = useContext(AuthContext);
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'shop') return <Redirect href="/customer/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
