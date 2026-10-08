import { Redirect } from 'expo-router';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useAuth } from '@/features/auth/useAuth';

export default function EntryRoute() {
  const { isLoading, token, user } = useAuth();
  if (isLoading) return <LoadingIndicator />;
  if (!token || !user) return <Redirect href="/(auth)/login" />;
  return <Redirect href={user.role === 'shop' ? '/shop/dashboard' : '/customer/dashboard'} />;
}
