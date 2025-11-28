import React, { createContext, useContext, useState } from 'react';

const EnrollmentContext = createContext();

export function EnrollmentProvider({ children }) {
  const [enrollmentChanged, setEnrollmentChanged] = useState(false);

  const notifyEnrollment = () => {
    setEnrollmentChanged(prev => !prev);
  };

  return (
    <EnrollmentContext.Provider value={{ enrollmentChanged, notifyEnrollment }}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  return useContext(EnrollmentContext);
}
