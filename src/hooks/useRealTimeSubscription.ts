
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
    // Create a unique channel name for this table subscription
    const channelName = `table-changes-${table}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create the channel
    const channel = supabase.channel(channelName);
    
    // Define the configuration for the subscription
    const config = {
      event: event,
      schema: schema,
      table: table,
    };
    
    if (filter) {
      // Add the filter if provided
      Object.assign(config, { filter });
    }
    
    // Subscribe to PostgreSQL changes with the correct API format
    channel
      .on('postgres_changes', config as any, (payload) => {
        callback(payload);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log(`Realtime subscription status for ${table}:`, status);
      });

    // Cleanup function to remove channel when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schema, table, event, filter, callback]);

  return { isConnected };
}
