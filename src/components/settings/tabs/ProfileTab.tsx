import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2, Upload, Key, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { SelfPasswordChangeDialog } from '../SelfPasswordChangeDialog';

const ProfileTab = () => {
  const { user, refreshUser, markProfileSaved } = useAuth();
  const { toast } = useToast();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const { saveProfile, isSaving } = useProfileSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Initialize form values when user data is loaded
  useEffect(() => {
    if (user) {
      console.log('[ProfileTab] Inicializando dados do usuário:', user.user_metadata);
      
      setEmail(user.email || '');
      const metadata = user?.user_metadata;
      if (metadata) {
        // Garantir que valores sejam strings e não undefined
        const currentFullName = metadata.full_name || '';
        const currentDisplayName = metadata.display_name || metadata.name || '';
        const currentAvatarUrl = metadata.avatar_url || metadata.avatar || '';
        
        setFullName(currentFullName);
        setDisplayName(currentDisplayName);
        setAvatarUrl(currentAvatarUrl);
        setPendingAvatarUrl(currentAvatarUrl);
        
        console.log('[ProfileTab] Dados carregados:', {
          fullName: currentFullName,
          displayName: currentDisplayName,
          avatarUrl: currentAvatarUrl
        });
      }
    }
  }, [user]);

  // Check for unsaved changes
  useEffect(() => {
    if (!user?.user_metadata) return;
    
    const metadata = user.user_metadata;
    const originalFullName = metadata.full_name || '';
    const originalDisplayName = metadata.display_name || metadata.name || '';
    const originalAvatarUrl = metadata.avatar_url || metadata.avatar || '';
    
    const hasChanges = 
      fullName !== originalFullName ||
      displayName !== originalDisplayName ||
      pendingAvatarUrl !== originalAvatarUrl;
    
    setHasUnsavedChanges(hasChanges);
  }, [fullName, displayName, pendingAvatarUrl, user]);
  
  const handleSaveProfile = async () => {
    console.log('[ProfileTab] Salvando perfil...');
    
    const success = await saveProfile({
      fullName,
      displayName,
      email,
      avatarUrl: pendingAvatarUrl
    });
    
    if (success) {
      // Update local state after successful save
      setAvatarUrl(pendingAvatarUrl);
      setHasUnsavedChanges(false);
      
      // Sinaliza profile recém salvo para evitar sobrescrita via refresh
      if (typeof markProfileSaved === 'function') markProfileSaved();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    console.log('[ProfileTab] Iniciando upload de avatar...');
    
    const newAvatarUrl = await uploadAvatar(file, user.id);
    if (newAvatarUrl) {
      console.log('[ProfileTab] Avatar carregado, URL:', newAvatarUrl);
      setPendingAvatarUrl(newAvatarUrl);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePasswordChangeSuccess = () => {
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso"
    });
  };

  const handleManualRefresh = async () => {
    console.log('[ProfileTab] Refresh manual solicitado...');
    await refreshUser();
    toast({
      title: "Dados atualizados",
      description: "Informações do perfil foram recarregadas"
    });
  };

  const getAvatarDisplay = () => {
    const displayUrl = pendingAvatarUrl || avatarUrl;
    
    if (displayUrl && displayUrl.trim() !== '') {
      return (
        <img 
          src={displayUrl} 
          alt="Avatar" 
          className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
          onLoad={() => {
            console.log('[ProfileTab] Avatar exibido com sucesso:', displayUrl);
          }}
          onError={(e) => {
            console.warn('[ProfileTab] Erro ao carregar imagem:', displayUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    return (
      <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-2xl font-bold border-2 border-gray-200">
        {displayName?.substring(0, 2).toUpperCase() || 'U'}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasUnsavedChanges && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-sm text-orange-800">
                ⚠️ Você tem alterações não salvas. Clique em "Salvar Perfil" para confirmar.
              </p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center space-y-4">
              <div className="relative">
                {getAvatarDisplay()}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute -bottom-2 -right-2 rounded-full p-2"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Clique para alterar sua foto de perfil
              </p>
              {pendingAvatarUrl !== avatarUrl && (
                <p className="text-xs text-orange-600 text-center">
                  Nova imagem carregada. Clique em "Salvar Perfil" para confirmar.
                </p>
              )}
            </div>
            <div className="md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de exibição</Label>
                  <Input 
                    id="displayName" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Como você quer ser chamado"
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
                  readOnly={!!user}
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
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving || isUploading || !hasUnsavedChanges}
            className={hasUnsavedChanges ? "bg-primary" : ""}
          >
            {isSaving ? (
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

      {/* Security Settings Card */}
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
