import { StyleSheet, Text } from 'react-native';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Text accessibilityRole="alert" style={styles.message}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: { color: '#C62828', fontSize: 13 },
});
