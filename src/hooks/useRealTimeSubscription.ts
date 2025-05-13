
import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Define the table change event types
type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Define the callback function type for real-time changes
export type TableSubscriptionCallback<T = Record<string, any>> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

/**
 * A hook for subscribing to real-time changes on a specific table
 */
export function useTableSubscription<T = Record<string, any>>(
  schema: string,
  table: string,
  event: PostgresChangeEvent = '*',
  callback: TableSubscriptionCallback<T>
): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create a channel with a specific name for this subscription
    const channelName = `${schema}-${table}-changes`;
    
    // Subscribe to the channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup function to remove the channel when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schema, table, event, callback]);

  return { isConnected };
}
