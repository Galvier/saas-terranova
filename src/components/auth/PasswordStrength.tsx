
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
  strength: number;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, strength }) => {
  if (!password) return null;

  const getStrengthColor = () => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 50) return 'Fraca';
    if (strength < 75) return 'Média';
    return 'Forte';
  };

  return (
    <div className="space-y-1 mt-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Força da senha:</span>
        <span className={`text-xs font-medium ${
          strength < 50 ? 'text-red-500' : 
          strength < 75 ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <Progress value={strength} className={getStrengthColor()} />
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center gap-1 text-xs">
          <div className={`h-2 w-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={password.length >= 8 ? 'text-green-700' : 'text-muted-foreground'}>
            Mínimo 8 caracteres
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
            Maiúsculas e minúsculas
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={/[0-9]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
            Números
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className={`h-2 w-2 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
            Símbolos
          </span>
        </div>
      </div>
    </div>
  );
};
