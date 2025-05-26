
import React from 'react';

const AppLogo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <img 
        src="/lovable-uploads/93cecebb-51e3-4cec-b407-4a6ea4c4f9d3.png" 
        alt="Terranova Logo" 
        className="h-12 w-auto"
      />
      <span className="font-semibold text-xl text-terranova-blue">Terranova</span>
    </div>
  );
};

export default AppLogo;
