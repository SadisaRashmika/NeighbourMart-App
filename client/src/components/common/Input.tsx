import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#6B7280"
        {...props}
        style={[styles.input, error ? styles.invalid : undefined, style]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: '#172B24', fontSize: 13, fontWeight: '700' },
  input: {
    borderColor: '#D8DEE8',
    borderRadius: 12,
    borderWidth: 1,
    color: '#111827',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  invalid: { borderColor: '#C62828' },
  error: { color: '#C62828', fontSize: 12 },
});
