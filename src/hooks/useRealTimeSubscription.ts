
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableSubscriptionProps = {
  tables: string[];
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onData?: (payload: RealtimePostgresChangesPayload<Record<string, any>>) => void;
};

export function useTableSubscription({ tables, schema = 'public', event = '*', onData }: TableSubscriptionProps) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create a new channel
    const newChannel = supabase.channel('db-changes');
    
    // Set up channel status handler
    newChannel
      .on('system', { event: 'status' }, (status) => {
        console.log('Realtime status changed:', status);
        setConnected(status.status === 'connected');
      });
    
    // Add subscription for each table
    tables.forEach(table => {
      newChannel.on(
        'postgres_changes', // This must match the channel event type
        { 
          event: event, 
          schema: schema, 
          table: table 
        }, 
        (payload: any) => {
          console.log(`${table} changed, payload:`, payload);
          // Cast the payload to the expected type
          if (onData) onData(payload as RealtimePostgresChangesPayload<Record<string, any>>);
        }
      );
    });
    
    // Subscribe to the channel
    newChannel.subscribe((status) => {
      console.log('Subscription status:', status);
    });
    
    // Store the channel reference
    setChannel(newChannel);
    
    // Clean up when component unmounts
    return () => {
      newChannel.unsubscribe();
    };
  }, [tables.join(','), schema, event, onData]); // Re-subscribe if any of these change
  
  return { connected, channel };
}
