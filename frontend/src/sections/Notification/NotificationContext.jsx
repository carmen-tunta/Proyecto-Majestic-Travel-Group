import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            color: notification.type === 'error' ? '#dc3545' : '#155724',
            backgroundColor: notification.type === 'error' ? '#f8d7da' : '#d4edda',
            border: notification.type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
            borderRadius: 4,
            padding: '12px 24px',
            fontSize: 16,
            minWidth: 300,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};