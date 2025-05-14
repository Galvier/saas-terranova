
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useTableSubscription(
  schema: string,
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  handler: (payload: RealtimePostgresChangesPayload<any>) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Convert '*' to an array with all events
    const eventType = event === '*' 
      ? ['INSERT', 'UPDATE', 'DELETE'] as const
      : event;
    
    // Create a new realtime channel
    const channelName = `table-changes-${schema}-${table}-${event}`;
    const channel = supabase.channel(channelName);
    
    // Configure the channel with postgres_changes filter
    channel
      .on(
        'postgres_changes',
        {
          event: eventType,
          schema: schema,
          table: table
        },
        handler
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log(`Realtime subscription status for ${table}:`, status);
      });
      
    // Debug log connection status
    console.log(`Realtime subscription initiated for ${schema}.${table} with event ${event}`);

    // Clean up the subscription when component unmounts
    return () => {
      console.log(`Cleaning up realtime subscription for ${schema}.${table}`);
      supabase.removeChannel(channel);
    };
  }, [schema, table, event, handler]);
  
  // Return object indicating if the connection is active
  return { isConnected };
}
