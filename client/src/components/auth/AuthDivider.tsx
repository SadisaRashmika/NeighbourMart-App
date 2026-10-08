import { StyleSheet, Text, View } from 'react-native';

export function AuthDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>OR CONTINUE WITH</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 10, marginVertical: 22 },
  line: { backgroundColor: '#E4E8EF', flex: 1, height: 1 },
  text: { color: '#98A2B3', fontSize: 11, fontWeight: '600' },
});
