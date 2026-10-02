import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DashboardRole = 'customer' | 'shop';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type DashboardTabsProps = {
  role: DashboardRole;
};

type DashboardTab = {
  label: string;
  icon: IconName;
};

const tabsByRole: Record<DashboardRole, DashboardTab[]> = {
  customer: [
    { label: 'Home', icon: 'home-outline' },
    { label: 'Browse', icon: 'search-outline' },
    { label: 'Orders', icon: 'receipt-outline' },
    { label: 'Profile', icon: 'person-outline' },
  ],
  shop: [
    { label: 'Overview', icon: 'grid-outline' },
    { label: 'Stock', icon: 'cube-outline' },
    { label: 'Orders', icon: 'receipt-outline' },
    { label: 'Profile', icon: 'person-outline' },
  ],
};

const dashboardCopy: Record<DashboardRole, { eyebrow: string; title: string; description: string }> = {
  customer: {
    eyebrow: 'CUSTOMER DASHBOARD · 104',
    title: 'Good morning, Neighbor',
    description: 'Find fresh products from trusted shops nearby.',
  },
  shop: {
    eyebrow: 'SHOP OWNER DASHBOARD · 111',
    title: 'Your shop at a glance',
    description: 'Keep stock fresh and orders moving smoothly.',
  },
};

export function DashboardTabs({ role }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const tabs = tabsByRole[role];
  const copy = dashboardCopy[role];
  const activeLabel = tabs[activeTab].label;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <TouchableOpacity
            accessibilityLabel="Log out"
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={18} color="#c9372c" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{activeTab === 0 ? copy.title : activeLabel}</Text>
        <Text style={styles.description}>
          {activeTab === 0 ? copy.description : `${activeLabel} for your NeighbourMart account.`}
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>{activeTab === 0 ? 'TODAY' : activeLabel.toUpperCase()}</Text>
          <Text style={styles.cardTitle}>
            {activeTab === 0 ? (role === 'customer' ? 'Fresh picks are waiting' : 'Your store is ready for business') : `${activeLabel} is ready`}
          </Text>
          <Text style={styles.cardText}>
            {role === 'customer' ? 'Explore nearby shops and build your next basket.' : 'Manage your neighbourhood shop from one place.'}
          </Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          return (
            <TouchableOpacity
              key={tab.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActiveTab(index)}
              style={styles.tabButton}
            >
              <Ionicons name={tab.icon} size={22} color={isActive ? '#00875a' : '#7a869a'} />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f9f8' },
  content: { flex: 1, padding: 24, paddingTop: 54 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  eyebrow: { color: '#00875a', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 12 },
  logoutButton: { alignItems: 'center', flexDirection: 'row', gap: 5, padding: 6 },
  logoutText: { color: '#c9372c', fontSize: 13, fontWeight: '700' },
  title: { color: '#172b24', fontSize: 30, fontWeight: '800', marginBottom: 8 },
  description: { color: '#5e6c67', fontSize: 15, lineHeight: 22, marginBottom: 28 },
  summaryCard: { backgroundColor: '#fff', borderColor: '#e1e9e5', borderRadius: 16, borderWidth: 1, padding: 20 },
  cardLabel: { color: '#00875a', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  cardTitle: { color: '#172b24', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  cardText: { color: '#5e6c67', fontSize: 14, lineHeight: 20 },
  tabBar: { backgroundColor: '#fff', borderColor: '#e1e9e5', borderTopWidth: 1, flexDirection: 'row', paddingBottom: 12, paddingTop: 10 },
  tabButton: { alignItems: 'center', flex: 1, gap: 4, minHeight: 52, justifyContent: 'center' },
  tabLabel: { color: '#7a869a', fontSize: 12, fontWeight: '600' },
  activeTabLabel: { color: '#00875a', fontWeight: '800' },
});
