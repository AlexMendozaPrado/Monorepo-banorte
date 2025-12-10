import { useState } from 'react';

// Type definitions
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  show: boolean;
  message: string;
  type: NotificationType;
  duration: number;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  const showNotification = (message: string, type: NotificationType = 'success', duration: number = 3000) => {
    setNotification({
      show: true,
      message,
      type,
      duration
    });

    // Auto-hide notification
    setTimeout(() => {
      hideNotification();
    }, duration);
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message: string, duration: number = 5000) => {
    showNotification(message, 'error', duration);
  };

  const showWarning = (message: string, duration: number = 4000) => {
    showNotification(message, 'warning', duration);
  };

  const showInfo = (message: string, duration: number = 3000) => {
    showNotification(message, 'info', duration);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
