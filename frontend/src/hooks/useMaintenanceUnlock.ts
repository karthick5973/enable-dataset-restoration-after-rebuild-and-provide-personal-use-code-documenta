import { useState } from 'react';

export function useMaintenanceUnlock() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [sessionPassword, setSessionPassword] = useState<string>('');

  const unlock = (password: string) => {
    setIsUnlocked(true);
    setSessionPassword(password);
  };

  const lock = () => {
    setIsUnlocked(false);
    setSessionPassword('');
  };

  return { isUnlocked, sessionPassword, unlock, lock, setSessionPassword };
}
