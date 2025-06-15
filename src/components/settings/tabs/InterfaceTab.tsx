
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2, Sun, Moon, Globe, AlertCircle } from 'lucide-react';
import { UserSettings } from '@/hooks/useUserSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface InterfaceTabProps {
  settings: UserSettings;
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

// Mobile Theme Selection Component - Compact Design
const MobileThemeSelection = ({ 
  value, 
  onValueChange 
}: { 
  value: string; 
  onValueChange: (value: 'light' | 'dark' | 'system') => void;
}) => {
  const themes = [
    { value: 'light', label: 'Claro', icon: Sun, color: 'text-amber-500' },
    { value: 'dark', label: 'Escuro', icon: Moon, color: 'text-blue-500' },
    { value: 'system', label: 'Sistema', icon: Globe, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-2">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isSelected = value === theme.value;
        
        return (
          <button
            key={theme.value}
            onClick={() => onValueChange(theme.value as 'light' | 'dark' | 'system')}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 min-h-[48px] touch-manipulation",
              isSelected 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border bg-background hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("h-4 w-4 flex-shrink-0", theme.color)} />
              <span className="text-sm font-medium">{theme.label}</span>
            </div>
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
              isSelected 
                ? "border-primary bg-primary" 
                : "border-muted-foreground"
            )}>
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Mobile Animation Toggle Component - Compact Design
const MobileAnimationToggle = ({ 
  checked, 
  onCheckedChange 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 min-h-[48px] touch-manipulation hover:bg-muted/50"
    >
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-sm font-medium">Animações</span>
        <span className="text-xs text-muted-foreground">
          Ativar animações na interface
        </span>
      </div>
      <div className="flex items-center flex-shrink-0 ml-3">
        <Checkbox 
          checked={checked}
          onCheckedChange={onCheckedChange}
          className={cn(
            "h-4 w-4",
            checked && "bg-primary border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          )}
        />
      </div>
    </button>
  );
};

const InterfaceTab = ({ settings, isSaving, hasChanges, onSave, onUpdateSettings }: InterfaceTabProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          Preferências de Interface
          {hasChanges && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600 font-normal">Alterações não salvas</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Personalize a aparência da interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 md:px-6">
        {/* Theme Selection */}
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Tema</Label>
            {isMobile ? (
              <MobileThemeSelection 
                value={settings.theme}
                onValueChange={(value) => onUpdateSettings({ theme: value })}
              />
            ) : (
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
            )}
          </div>
        </div>
        
        {/* Animation Settings */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Configurações</Label>
          {isMobile ? (
            <MobileAnimationToggle
              checked={settings.animationsEnabled}
              onCheckedChange={(value) => onUpdateSettings({ animationsEnabled: value })}
            />
          ) : (
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
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-4 md:px-6 py-4">
        <Button 
          onClick={onSave} 
          disabled={isSaving || !hasChanges}
          className={cn(
            "w-full md:w-auto",
            hasChanges && "bg-primary hover:bg-primary/90"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {hasChanges ? "Salvar Alterações" : "Salvar"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterfaceTab;
