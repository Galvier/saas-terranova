
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Sun, Moon, Globe } from 'lucide-react';
import { UserSettings } from '@/hooks/useUserSettings';

interface InterfaceTabProps {
  settings: UserSettings;
  isSaving: boolean;
  onSave: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const InterfaceTab = ({ settings, isSaving, onSave, onUpdateSettings }: InterfaceTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Interface</CardTitle>
        <CardDescription>
          Personalize a aparência e funcionamento da interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <RadioGroup 
              value={settings.theme} 
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                onUpdateSettings({ theme: value })} 
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>Claro</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span>Escuro</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Sistema</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Densidade de Informações</Label>
            <RadioGroup 
              value={settings.density} 
              onValueChange={(value: 'compact' | 'default' | 'comfortable') => 
                onUpdateSettings({ density: value })} 
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="density-compact" />
                <Label htmlFor="density-compact">Compacto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="density-default" />
                <Label htmlFor="density-default">Padrão</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comfortable" id="density-comfortable" />
                <Label htmlFor="density-comfortable">Confortável</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Animações</Label>
          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="text-sm text-muted-foreground">
              Ativar animações na interface
            </Label>
            <Switch 
              id="animations" 
              checked={settings.animationsEnabled}
              onCheckedChange={(value) => onUpdateSettings({ animationsEnabled: value })}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Preferências
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterfaceTab;
