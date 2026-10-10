import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import type { ReactNode } from 'react';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  rightElement?: ReactNode;
};

export function Input({ label, error, rightElement, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.invalid : undefined, style as any]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#6B7280"
          {...props}
          style={styles.input}
        />
        {rightElement}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: '#172B24', fontSize: 13, fontWeight: '700' },
  input: {
    color: '#111827',
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputContainer: { alignItems: 'center', borderColor: '#D8DEE8', borderRadius: 12, borderWidth: 1, flexDirection: 'row' },
  invalid: { borderColor: '#C62828' },
  error: { color: '#C62828', fontSize: 12 },
});
