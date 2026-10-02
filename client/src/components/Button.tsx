import React from 'react';
import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

type ButtonProps = TouchableOpacityProps & {
  label: string;
};

export function Button({ label, style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity {...props} style={[styles.button, style]}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: '#00875a', borderRadius: 12, padding: 14 },
  label: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
