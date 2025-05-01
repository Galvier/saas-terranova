
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { authCredentials } from '@/services/auth';

const FirstAccess = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação precisam ser idênticas",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (passwordStrength < 50) {
      toast({
        title: "Senha fraca",
        description: "Use uma combinação de letras, números e símbolos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authCredentials.signUp({
        name,
        email,
        password
      });
      
      if (result.error) {
        throw new Error(result.error.message || "Erro ao criar usuário");
      }
      
      setSuccessMessage("Usuário administrador criado com sucesso!");
      toast({
        title: "Configuração concluída",
        description: "Use as credenciais criadas para fazer login"
      });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login', { state: { email: email } });
      }, 2000);
      
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário administrador",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <AppLogo />
        </div>
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold">Configuração Inicial</CardTitle>
            </div>
            <CardDescription>
              Configure o primeiro usuário administrador para acessar o sistema
            </CardDescription>
          </CardHeader>
          <RegistrationForm
            name={name}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            passwordStrength={passwordStrength}
            showPassword={showPassword}
            isLoading={isLoading}
            successMessage={successMessage}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
          />
        </Card>
      </div>
    </div>
  );
};

export default FirstAccess;
