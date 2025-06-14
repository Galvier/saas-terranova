
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SelfPasswordChangeDialog } from '../SelfPasswordChangeDialog';

const ProfileTab = () => {
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handlePasswordChangeSuccess = () => {
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Settings Card (apenas) */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Segurança</CardTitle>
          <CardDescription>
            Gerencie suas configurações de segurança e acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Senha da conta</h4>
              <p className="text-sm text-muted-foreground">
                Altere sua senha para manter sua conta segura
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <SelfPasswordChangeDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default ProfileTab;

