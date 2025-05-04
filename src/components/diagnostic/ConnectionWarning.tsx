
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ConnectionWarningProps {
  visible: boolean;
  message?: string;
  details?: string;
}

const ConnectionWarning = ({ visible, message, details }: ConnectionWarningProps) => {
  if (!visible) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Problema de conexão com o banco de dados</AlertTitle>
      <AlertDescription>
        <p>{message || 'Não foi possível conectar ao banco de dados Supabase. Verifique sua conexão com a internet e recarregue a página.'}</p>
        {details && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">Detalhes técnicos</summary>
            <pre className="mt-1 bg-slate-800 text-white p-2 rounded overflow-auto text-xs">
              {details}
            </pre>
          </details>
        )}
        <p className="text-sm mt-2">Se o problema persistir, contate o suporte técnico.</p>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionWarning;
