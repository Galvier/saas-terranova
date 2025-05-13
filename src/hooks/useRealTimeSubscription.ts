
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
 * Custom hook for creating and managing Supabase real-time subscriptions
 */
export function useRealTimeSubscription({ tables, schema = 'public', event = '*', onData }: SubscriptionConfig) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    console.log(`Setting up realtime subscription for tables: ${tables.join(', ')}`);
    
    // Create a channel for all the specified tables
    const channelName = `${tables.join('-')}-changes`;
    const channel = supabase.channel(channelName);
    
    // Add subscription for each table
    tables.forEach(table => {
      channel.on(
        'postgres_changes',  
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
        console.log(`Realtime subscription status for ${channelName}:`, status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup function
    return () => {
      console.log(`Unsubscribing from realtime channel ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [tables, schema, event, onData]);

  return { isSubscribed };
}
