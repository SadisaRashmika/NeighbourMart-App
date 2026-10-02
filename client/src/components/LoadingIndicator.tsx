import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#00875a" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
