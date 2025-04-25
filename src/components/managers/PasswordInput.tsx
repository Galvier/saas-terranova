
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showStrengthIndicator?: boolean;
  placeholder?: string;
  isConfirmPassword?: boolean;
  confirmValue?: string;
}

const PasswordInput = ({
  label,
  value,
  onChange,
  showStrengthIndicator = false,
  placeholder = "Digite uma senha segura",
  isConfirmPassword = false,
  confirmValue
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState(0);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    onChange(newPassword);
    if (showStrengthIndicator) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="relative">
        <Input
          id={label}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={handlePasswordChange}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      
      {showStrengthIndicator && <PasswordStrength password={value} strength={passwordStrength} />}
      
      {isConfirmPassword && value && confirmValue && value !== confirmValue && (
        <p className="text-xs text-red-500 mt-1">As senhas não conferem</p>
      )}
    </div>
  );
};

export default PasswordInput;

