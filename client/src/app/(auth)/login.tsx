import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';

export default function Login() {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Header
        subtitle="Fresh local groceries with convenient neighborhood pickup."
        title="Welcome Neighbor!"
      />
      <Input keyboardType="phone-pad" label="Mobile phone number" placeholder="77 123 4567" />
      <Link asChild href="/customer/dashboard">
        <Button label="Continue as customer" />
      </Link>
      <Link asChild href="/shop/dashboard">
        <Button label="Continue as shop owner" />
      </Link>
      <View style={styles.links}>
        <Link href="/(auth)/customer-signup">Create customer account</Link>
        <Link href="/(auth)/shop-signup">Register a shop</Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: 18, justifyContent: 'center', padding: 24 },
  links: { alignItems: 'center', gap: 12 },
});
