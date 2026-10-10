import { EmptyState } from '@/components/common/EmptyState';
import { RoleHeader } from '@/components/common/RoleHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCustomerOrders } from '@/features/customer/useCustomerOrders';
import { cash } from '@/components/customer/PrototypeUI';

export default function CustomerOrders() {
  const { orders, loading, error, reload } = useCustomerOrders();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderStatus}>{item.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.orderTotal}>Total: {cash(item.total)}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><RoleHeader role="customer" location="Add your neighborhood" /></View>
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color="#007332" size="large" style={{ marginTop: 20 }} />
        ) : error ? (
          <TouchableOpacity onPress={reload}><Text style={styles.errorText}>{error} - Tap to retry</Text></TouchableOpacity>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(o) => o.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState description="Current and previous customer orders will appear here." title="Customer Orders" />}
            refreshing={loading}
            onRefresh={reload}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  body: { flex: 1 },
  list: { padding: 16, gap: 12 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E8EF',
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: '700',
    fontSize: 16,
    color: '#172B24',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007332',
  },
  orderTotal: {
    fontSize: 14,
    color: '#646D65',
  },
});
