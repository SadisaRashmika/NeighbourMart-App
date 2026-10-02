import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Text style={styles.title}>This screen does not exist.</Text>
      <Link href="/" style={styles.link}>
        Return to NeighbourMart
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  title: { color: '#101828', fontSize: 20, fontWeight: '700' },
  link: { color: '#138A43', fontSize: 16, fontWeight: '700' },
});
