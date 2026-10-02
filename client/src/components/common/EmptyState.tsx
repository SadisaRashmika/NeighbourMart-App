import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>NeighbourMart</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  badge: { color: '#138A43', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  title: { color: '#101828', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  description: { color: '#667085', fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: 'center' },
});
