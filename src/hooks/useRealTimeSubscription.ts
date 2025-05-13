
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type SubscriptionConfig = {
  tables: string[];
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onData?: (payload: RealtimePostgresChangesPayload<Record<string, any>>) => void;
};

/**
 * Hook for subscribing to real-time updates from Supabase
 */
export const useRealTimeSubscription = (config: SubscriptionConfig) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { tables, schema = 'public', event = '*', onData } = config;
  
  useEffect(() => {
    console.log(`Setting up real-time subscription for tables: ${tables.join(', ')}`);
    
    // Create a channel for real-time communication
    const channel = supabase.channel('schema-db-changes');
    
    // Add subscription for each table
    tables.forEach(table => {
      channel.on(
        'postgres_changes' as any, 
        { 
          event: event, 
          schema: schema, 
          table: table 
        }, 
        (payload) => {
          console.log(`${table} changed, payload:`, payload);
          if (onData) onData(payload);
        }
      );
    });
    
    // Subscribe to the channel
    channel
      .subscribe((status) => {
        console.log(`Subscription status:`, status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });
    
    // Cleanup function to remove the channel when component unmounts
    return () => {
      console.log(`Removing real-time subscription for tables: ${tables.join(', ')}`);
      supabase.removeChannel(channel);
    };
  }, [tables.join(','), schema, event]); // Re-run if tables, schema or event changes

  return { isSubscribed };
};
