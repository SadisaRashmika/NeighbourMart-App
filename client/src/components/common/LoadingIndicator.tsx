import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingIndicator() {
  return (
    <View accessibilityLabel="Loading" style={styles.container}>
      <ActivityIndicator color="#138A43" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
