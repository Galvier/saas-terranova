
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTableSubscription(
  schema: string,
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  handler: (payload: any) => void
) {
  useEffect(() => {
    // Inscreve-se para atualizações em tempo real
    const subscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table
        },
        handler
      )
      .subscribe();

    // Limpa a inscrição quando o componente é desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [schema, table, event, handler]);
}
