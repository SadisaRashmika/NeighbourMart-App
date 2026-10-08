import { Redirect, Stack } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function CustomerLayout() {
  const { user } = useContext(AuthContext);
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'customer') return <Redirect href="/shop/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
