
import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isCheckingConnection: boolean;
  connectionStatus: boolean | null;
  onRetryConnection: () => void;
  isTesting?: boolean;
  connectionDetails?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isCheckingConnection,
  connectionStatus,
  onRetryConnection,
  isTesting,
  connectionDetails
}) => {
  if (isCheckingConnection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verificando conexão com o banco de dados...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center max-w-md text-center p-4">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro de conexão</h2>
          <p className="text-muted-foreground mb-4">
            {connectionDetails || "Não foi possível conectar ao banco de dados. Verifique sua conexão e tente novamente."}
          </p>
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            <Button 
              onClick={onRetryConnection}
              variant="default"
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar conexão
                </>
              )}
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Recarregar página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
