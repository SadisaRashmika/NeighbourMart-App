import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type RoutePlaceholderProps = {
  code: string;
  title: string;
};

export function RoutePlaceholder({ code, title }: RoutePlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  code: {
    marginBottom: 8,
    color: '#00875a',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#111',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
