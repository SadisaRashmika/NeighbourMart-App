import { PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader } from './AuthHeader';

type AuthScreenProps = PropsWithChildren<{
  header?: ReactNode;
}>;

export function AuthScreen({ children, header }: AuthScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {header ?? <AuthHeader />}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFFFFF', flex: 1 },
  content: { flexGrow: 1, paddingBottom: 40 },
});
