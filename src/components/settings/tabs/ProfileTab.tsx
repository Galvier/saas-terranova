
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ProfileTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Initialize form values when user data is loaded
    if (user) {
      setEmail(user.email || '');
      // Use metadata if available
      const metadata = user?.user_metadata;
      if (metadata) {
        setFullName(metadata.full_name || metadata.name || '');
        setDisplayName(metadata.display_name || metadata.name || '');
      }
    }
  }, [user]);
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso"
      });
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e preferências
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                {displayName?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full p-2">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Clique para alterar sua foto de perfil
            </p>
          </div>
          <div className="md:w-2/3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input 
                  id="fullName" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input 
                  id="displayName" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!user} // Email is readonly if logged in
                className={user ? "bg-muted" : ""}
              />
              {user && (
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado depois do registro
                </p>
              )}
            </div>
            {user?.app_metadata?.role && (
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Input 
                  id="role" 
                  defaultValue={user.app_metadata.role} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button onClick={handleSaveProfile} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Perfil
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileTab;
