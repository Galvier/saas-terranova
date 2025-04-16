
import React from 'react';

const AppLogo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-primary rounded-md w-8 h-8 flex items-center justify-center text-primary-foreground font-bold">
        BM
      </div>
      <span className="font-semibold text-lg">Business Manager</span>
    </div>
  );
};

export default AppLogo;
