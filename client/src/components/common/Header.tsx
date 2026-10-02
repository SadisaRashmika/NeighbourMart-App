import { StyleSheet, Text, View } from 'react-native';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>NeighbourMart</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  brand: { color: '#138A43', fontSize: 14, fontWeight: '800' },
  title: { color: '#101828', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#667085', fontSize: 15, lineHeight: 22 },
});
