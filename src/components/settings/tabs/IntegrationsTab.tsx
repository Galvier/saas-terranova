
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IntegrationsTab = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de integração foram atualizadas"
      });
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações</CardTitle>
        <CardDescription>
          Configure integrações com serviços externos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Chave de API</Label>
            <Input 
              id="api-key" 
              type="password" 
              placeholder="Insira sua chave de API"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="export-enabled">Exportação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Exportar dados automaticamente para sistemas externos
              </p>
            </div>
            <Switch id="export-enabled" />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Formatos de Exportação</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => toast({ 
                  title: "Formato selecionado", 
                  description: "Exportação em CSV configurada" 
                })}
              >
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => toast({ 
                  title: "Formato selecionado", 
                  description: "Exportação em Excel configurada" 
                })}
              >
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => toast({ 
                  title: "Formato selecionado", 
                  description: "Exportação em PDF configurada" 
                })}
              >
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => toast({ 
                  title: "Formato selecionado", 
                  description: "Exportação em JSON configurada" 
                })}
              >
                JSON
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationsTab;
