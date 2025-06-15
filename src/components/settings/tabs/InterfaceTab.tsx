
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Sun, Moon, Globe } from 'lucide-react';
import { UserSettings } from '@/hooks/useUserSettings';
import { useIsMobile } from '@/hooks/use-mobile';

interface InterfaceTabProps {
  settings: UserSettings;
  isSaving: boolean;
  onSave: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const InterfaceTab = ({ settings, isSaving, onSave, onUpdateSettings }: InterfaceTabProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle>Preferências de Interface</CardTitle>
        <CardDescription>
          Personalize a aparência da interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 md:px-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Tema</Label>
            <RadioGroup 
              value={settings.theme} 
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                onUpdateSettings({ theme: value })} 
              className="space-y-3"
            >
              <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50">
                <Label htmlFor="theme-light" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Sun className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Claro</span>
                </Label>
                <RadioGroupItem value="light" id="theme-light" className="flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50">
                <Label htmlFor="theme-dark" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Moon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Escuro</span>
                </Label>
                <RadioGroupItem value="dark" id="theme-dark" className="flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50">
                <Label htmlFor="theme-system" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Globe className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Sistema</span>
                </Label>
                <RadioGroupItem value="system" id="theme-system" className="flex-shrink-0" />
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-base font-medium">Animações</Label>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <Label htmlFor="animations" className="text-sm text-muted-foreground cursor-pointer flex-1">
              Ativar animações na interface
            </Label>
            <Switch 
              id="animations" 
              checked={settings.animationsEnabled}
              onCheckedChange={(value) => onUpdateSettings({ animationsEnabled: value })}
              className="flex-shrink-0"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-4 md:px-6 py-4">
        <Button onClick={onSave} disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterfaceTab;
