import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProgressContextType {
  cloudConnected: boolean;
  resourceCreated: boolean;
  complianceChecked: boolean;
  terraformCode: string;
  setCloudConnected: (state: boolean) => void;
  setResourceCreated: (state: boolean) => void;
  setComplianceChecked: (state: boolean) => void;
  setStep: (step: number) => void;
  setTerraformCode: (code: string) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  // Load from localStorage or fallback to default states
  const [cloudConnected, setCloudConnected] = useState<boolean>(() => JSON.parse(localStorage.getItem("cloudConnected") || "false"));
  const [resourceCreated, setResourceCreated] = useState<boolean>(() => JSON.parse(localStorage.getItem("resourceCreated") || "false"));
  const [complianceChecked, setComplianceChecked] = useState<boolean>(() => JSON.parse(localStorage.getItem("complianceChecked") || "false"));
  const [step, setStep] = useState<number>(parseInt(localStorage.getItem("step") || "0"));
  const [terraformCode, setTerraformCode] = useState<string>(localStorage.getItem("terraformCode") || "");

  // UseEffect to update localStorage whenever states change
  useEffect(() => {
    localStorage.setItem("cloudConnected", JSON.stringify(cloudConnected));
    localStorage.setItem("resourceCreated", JSON.stringify(resourceCreated));
    localStorage.setItem("complianceChecked", JSON.stringify(complianceChecked));
    localStorage.setItem("step", step.toString());
    localStorage.setItem("terraformCode", terraformCode);
  }, [cloudConnected, resourceCreated, complianceChecked, step, terraformCode]);

  return (
    <ProgressContext.Provider value={{
      cloudConnected,
      resourceCreated,
      complianceChecked,
      terraformCode,
      setCloudConnected,
      setResourceCreated,
      setComplianceChecked,
      setTerraformCode,
      setStep
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
