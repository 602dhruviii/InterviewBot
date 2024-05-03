// UserResponsesContext.js
import React, { createContext, useContext, useState } from 'react';

const UserResponsesContext = createContext();

export const useUserResponses = () => {
  const context = useContext(UserResponsesContext);
  if (!context) {
    throw new Error('useUserResponses must be used within a UserResponsesProvider');
  }
  return context;
};

export const UserResponsesProvider = ({ children }) => {
  const [userResponses, setUserResponses] = useState({});

  const updateUserResponses = (question, response) => {
    setUserResponses((prevResponses) => ({ ...prevResponses, [question]: response }));
  };

  const contextValue = { userResponses, updateUserResponses };

  return (
    <UserResponsesContext.Provider value={contextValue}>
      {children}
    </UserResponsesContext.Provider>
  );
};
