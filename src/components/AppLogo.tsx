
import React from 'react';

const AppLogo = ({ className }: { className?: string }) => {
  const [logoSrc, setLogoSrc] = React.useState("/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png");

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setLogoSrc(
        isDark
          ? "/lovable-uploads/3efaf253-28c6-44f9-b580-bf1291deca16.png" // Logo para tema escuro
          : "/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png"  // Logo para tema claro
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    // Set initial value
    const isDark = document.documentElement.classList.contains('dark');
     setLogoSrc(
        isDark
          ? "/lovable-uploads/3efaf253-28c6-44f9-b580-bf1291deca16.png"
          : "/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png"
      );

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <img 
        src={logoSrc} 
        alt="Terranova Logo" 
        className="h-12 w-auto"
      />
      <span className="font-semibold text-xl text-terranova-blue">Terranova</span>
    </div>
  );
};

export default AppLogo;
