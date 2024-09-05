import React, { createContext, useState, useContext, ReactNode } from 'react';
import {Agency} from "../types/Types";

interface AgencyContextType {
    agency: Agency | null;
    setAgency: (agency: Agency) => void;
}

// Create the context with default values
const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

// Custom hook to use the AgencyContext
export const useAgency = (): AgencyContextType => {
    const context = useContext(AgencyContext);
    if (!context) {
        throw new Error('useAgency must be used within an AgencyProvider');
    }
    return context;
};

// Provider component
export const AgencyProvider = ({ children }: { children: ReactNode }) => {
    const [agency, setAgency] = useState<Agency | null>(null);

    return (
        <AgencyContext.Provider value={{ agency, setAgency }}>
            {children}
        </AgencyContext.Provider>
    );
};
