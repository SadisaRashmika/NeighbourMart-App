import { EmptyState } from '@/components/common/EmptyState';
import { RoleHeader } from '@/components/common/RoleHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

export default function Cart() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><RoleHeader role="customer" location="Add your neighborhood" /></View>
      <View style={styles.body}><EmptyState description="Selected products, quantities, substitutions, and order totals will appear here." title="Cart / Order Summary" /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  body: { flex: 1 },
});
