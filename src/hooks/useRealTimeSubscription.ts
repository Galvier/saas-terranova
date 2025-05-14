
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: RealtimePostgresChangesPayload<any>) => void;

interface SubscriptionOptions {
  schema?: string;
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

export function useRealTimeSubscription(
  options: SubscriptionOptions,
  callback: SubscriptionCallback
) {
  const [isConnected, setIsConnected] = useState(false);
  const { schema = 'public', table, event = '*', filter } = options;

  useEffect(() => {
    // Create channel with proper configuration
    const channel = supabase
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        { 
          event: event, 
          schema: schema, 
          table: table, 
          filter: filter 
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schema, table, event, filter, callback]);

  return { isConnected };
}
