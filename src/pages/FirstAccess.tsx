import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { authCredentials } from '@/services/auth';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

interface FirstAccessProps {
  // You can define props here if needed
}

const FirstAccess: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (data: any) => {
    if (!data.name || !data.email || !data.password) {
      toast({
        title: 'Erro ao registrar',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Use authCredentials.register instead of authService.signUp
      const result = await authCredentials.register({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'admin'
      });

      if (result.error) {
        toast({
          title: 'Erro ao registrar',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registro bem-sucedido',
          description: 'Seu acesso foi criado com sucesso.',
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao tentar registrar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Acesso Administrativo</CardTitle>
          <CardDescription>
            Crie o primeiro usuário administrador do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <RegistrationForm onSubmit={handleRegister} isLoading={isLoading} />
        </CardContent>
        <CardFooter>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            Voltar para Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FirstAccess;
