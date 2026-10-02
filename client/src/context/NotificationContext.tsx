import { createContext, useCallback, useMemo, useState, type PropsWithChildren } from 'react';

type NotificationContextValue = {
  message: string | null;
  clearMessage: () => void;
  showMessage: (message: string) => void;
};

export const NotificationContext = createContext<NotificationContextValue>({
  message: null,
  clearMessage: () => undefined,
  showMessage: () => undefined,
});

export function NotificationProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState<string | null>(null);
  const clearMessage = useCallback(() => setMessage(null), []);
  const showMessage = useCallback((nextMessage: string) => setMessage(nextMessage), []);
  const value = useMemo(
    () => ({ clearMessage, message, showMessage }),
    [clearMessage, message, showMessage]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
