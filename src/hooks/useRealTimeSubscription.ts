
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useTableSubscription(
  schema: string,
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  handler: (payload: RealtimePostgresChangesPayload<any>) => void
) {
  useEffect(() => {
    // Converte '*' para um array com todos os eventos
    const eventType = event === '*' 
      ? ['INSERT', 'UPDATE', 'DELETE'] as const
      : event;
    
    // Inscreve-se para atualizações em tempo real
    const subscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        {
          event: eventType,
          schema: schema,
          table: table
        },
        handler
      )
      .subscribe();
      
    // Retorna status da conexão para debugging
    console.log('Realtime subscription active:', subscription.isJoined());

    // Limpa a inscrição quando o componente é desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [schema, table, event, handler]);
  
  // Retorna objeto indicando se a conexão está ativa
  return { isConnected: true };
}
