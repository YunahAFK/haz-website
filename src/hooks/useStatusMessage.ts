// src/hooks/useStatusMessage.ts
import { useState } from 'react';

export type StatusType = 'success' | 'error' | null;

interface StatusMessage {
  type: StatusType;
  message: string;
}

export const useStatusMessage = (autoClearDelay = 3000) => {
  const [status, setStatus] = useState<StatusMessage>({ type: null, message: '' });

  const setStatusMessage = (type: StatusType, message: string, autoClear = true) => {
    setStatus({ type, message });
    
    if (autoClear && type && autoClearDelay > 0) {
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, autoClearDelay);
    }
  };

  const clearStatus = () => setStatus({ type: null, message: '' });

  return { status, setStatusMessage, clearStatus };
};
