import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

const mockNotifications = [
  { id: '1', title: 'Order Accepted', message: 'Your order has been accepted by the shop and is being prepared.', time: '10 mins ago', type: 'order', read: false },
  { id: '2', title: 'Password Changed', message: 'Your account password was updated successfully.', time: '1 hour ago', type: 'security', read: true },
  { id: '3', title: 'New Deal Available', message: 'Get 20% off on fresh dairy products today!', time: '2 hours ago', type: 'promo', read: true },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return 'cube-outline';
      case 'security': return 'lock-closed-outline';
      case 'promo': return 'pricetag-outline';
      default: return 'notifications-outline';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#172B24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.map(n => (
          <TouchableOpacity key={n.id} style={[styles.notificationCard, !n.read && styles.unreadCard]} onPress={() => markAsRead(n.id)}>
            <View style={styles.iconContainer}>
              <Ionicons name={getIcon(n.type) as any} size={20} color={!n.read ? '#138A43' : '#667085'} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.message}>{n.message}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
            {!n.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F9F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E4E8EF' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#172B24' },
  content: { padding: 16, gap: 12 },
  notificationCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E4E8EF', alignItems: 'flex-start' },
  unreadCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  iconContainer: { marginRight: 12, marginTop: 2 },
  textContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: '800', color: '#172B24', marginBottom: 4 },
  message: { fontSize: 13, color: '#667085', lineHeight: 18, marginBottom: 6 },
  time: { fontSize: 11, color: '#98A2B3' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#138A43', marginTop: 6, marginLeft: 8 },
});
