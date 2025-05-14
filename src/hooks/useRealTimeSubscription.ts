
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
    
    // Subscribe to real-time updates
    const channel = supabase.channel('table-changes');
    
    // The correct way to add a postgres_changes listener
    channel
      .on(
        'postgres_changes',
        {
          event: eventType,
          schema: schema,
          table: table
        },
        handler
      );
    
    // Subscribe to the channel and track status
    channel.subscribe((status) => {
      // Update connection status based on the subscription status
      setIsConnected(status === 'SUBSCRIBED');
      console.log('Realtime subscription status:', status);
    });
      
    // Debug log connection status
    console.log('Realtime subscription initiated');

    // Clean up the subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schema, table, event, handler]);
  
  // Return object indicating if the connection is active
  return { isConnected };
}
