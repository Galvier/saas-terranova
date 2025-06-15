
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Variable {
  name: string;
  description: string;
  example: string;
  category: string;
}

interface VariablesHelperProps {
  onVariableClick?: (variable: string) => void;
}

const VariablesHelper: React.FC<VariablesHelperProps> = ({ onVariableClick }) => {
  const { toast } = useToast();

  const variables: Variable[] = [
    // Variáveis de sistema
    { name: 'user_name', description: 'Nome do usuário destinatário', example: 'João Silva', category: 'Sistema' },
    { name: 'department_name', description: 'Nome do departamento', example: 'Vendas', category: 'Sistema' },
    { name: 'current_date', description: 'Data atual', example: '15/06/2025', category: 'Sistema' },
    { name: 'current_period', description: 'Período atual (mês/ano)', example: '06/2025', category: 'Sistema' },
    
    // Variáveis de métricas
    { name: 'metric_name', description: 'Nome da métrica', example: 'Vendas Mensais', category: 'Métricas' },
    { name: 'target', description: 'Meta da métrica', example: '100', category: 'Métricas' },
    { name: 'current_value', description: 'Valor atual da métrica', example: '85', category: 'Métricas' },
    { name: 'unit', description: 'Unidade da métrica', example: 'unidades', category: 'Métricas' },
    { name: 'achievement_percentage', description: 'Percentual de atingimento', example: '95.5%', category: 'Métricas' },
    
    // Variáveis de contagem
    { name: 'count', description: 'Contagem (justificativas pendentes, etc)', example: '5', category: 'Contadores' },
    { name: 'pending_count', description: 'Número de itens pendentes', example: '3', category: 'Contadores' },
  ];

  const handleVariableClick = (variableName: string) => {
    if (onVariableClick) {
      onVariableClick(variableName);
    } else {
      // Copiar para área de transferência como fallback
      navigator.clipboard.writeText(`{{${variableName}}}`);
      toast({
        title: 'Variável copiada',
        description: `{{${variableName}}} foi copiada para a área de transferência`,
      });
    }
  };

  const groupedVariables = variables.reduce((groups, variable) => {
    const category = variable.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(variable);
    return groups;
  }, {} as Record<string, Variable[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sistema': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Métricas': return 'bg-green-100 text-green-800 border-green-200';
      case 'Contadores': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Guia de Variáveis
        </CardTitle>
        <CardDescription className="text-xs">
          Clique nas variáveis para inserir na mensagem. Elas serão substituídas automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedVariables).map(([category, categoryVariables]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(category)} variant="outline">
                {category}
              </Badge>
            </div>
            <div className="grid gap-2">
              {categoryVariables.map((variable) => (
                <div
                  key={variable.name}
                  className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">
                        {`{{${variable.name}}}`}
                      </code>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {variable.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      <span className="font-medium">Exemplo:</span> {variable.example}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVariableClick(variable.name)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    {onVariableClick ? (
                      <span className="text-xs">+</span>
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded border border-blue-200">
          <strong>💡 Dicas importantes:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Use as variáveis exatamente como mostrado, com as chaves duplas</li>
            <li>Variáveis de métricas só funcionam em contextos específicos</li>
            <li>Teste sempre suas mensagens antes de enviar em massa</li>
            <li>Variáveis não encontradas aparecerão como texto normal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariablesHelper;
