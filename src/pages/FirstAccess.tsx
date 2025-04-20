
// Removido Supabase: simula apenas formulário para demonstração.

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

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
  const location = useLocation();

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

  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
      toast({
        title: "Configuração concluída",
        description: "Use as credenciais criadas para fazer login",
      });
    }
  }, [location.state, toast]);

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Usuário criado (DEMO, não salvo no banco de dados)!");
      toast({
        title: "Configuração concluída",
        description: "Usuário criado apenas na demonstração."
      });
      setTimeout(() => {
        navigate('/login', { state: { email: email } });
      }, 2000);
    }, 1000);
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
              Configure o primeiro usuário administrador para acessar o sistema<br/>
              <span className="font-bold text-xs">(Demonstração: usuário não será salvo)</span>
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
          <div className="mt-4 text-xs text-muted-foreground">
            <b>Usuários de demonstração:</b>
            <ul>
              <li>admin@teste.com / senha123</li>
              <li>usuario@teste.com / senha123</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FirstAccess;

