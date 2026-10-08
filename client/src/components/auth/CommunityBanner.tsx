import { StyleSheet, Text, View } from 'react-native';

export function CommunityBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.avatars}>
        <View style={[styles.avatar, styles.green]} />
        <View style={[styles.avatar, styles.yellow]} />
        <View style={[styles.avatar, styles.red]} />
      </View>
      <Text style={styles.text}><Text style={styles.strong}>Over 12,000+</Text> local families shop nearby</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { alignItems: 'center', backgroundColor: '#F2FFF7', borderColor: '#D8F5E3', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', padding: 10 },
  avatars: { flexDirection: 'row' },
  avatar: { borderColor: '#fff', borderRadius: 12, borderWidth: 2, height: 24, width: 24 },
  green: { backgroundColor: '#0D9B58' },
  yellow: { backgroundColor: '#F9AE17', marginLeft: -7 },
  red: { backgroundColor: '#EE5D54', marginLeft: -7 },
  text: { color: '#17603A', fontSize: 12 },
  strong: { fontWeight: '800' },
});
