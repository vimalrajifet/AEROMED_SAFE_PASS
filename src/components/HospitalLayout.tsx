import React from 'react';

interface HospitalLayoutProps {
    children: React.ReactNode;
}

export const HospitalLayout: React.FC<HospitalLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen bg-[#050505] overflow-hidden">
            {children}
        </div>
    );
};
