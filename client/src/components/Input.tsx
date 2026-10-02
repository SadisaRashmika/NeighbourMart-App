import React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

type InputProps = TextInputProps & {
  label: string;
};

export function Input({ label, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: '#172b24', fontSize: 12, fontWeight: '700' },
  input: { borderColor: '#dfe1e6', borderRadius: 12, borderWidth: 1, padding: 14 },
});
