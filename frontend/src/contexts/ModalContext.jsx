import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal debe ser usado dentro de un ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const value = {
    isModalOpen,
    setIsModalOpen
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
