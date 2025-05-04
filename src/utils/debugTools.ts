
/**
 * Utility function to log database function calls and parameters
 */
export const logFunctionCall = (functionName: string, params: any) => {
  console.group(`Calling DB Function: ${functionName}`);
  console.log('Parameters:', JSON.stringify(params, null, 2));
  console.groupEnd();
};

/**
 * Utility function to log the results of database function calls
 */
export const logFunctionResult = (functionName: string, result: any, error?: any) => {
  console.group(`DB Function Result: ${functionName}`);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result:', result);
  }
  console.groupEnd();
};

/**
 * Utility function to validate database connection
 */
export const validateConnection = async (supabaseClient: any) => {
  try {
    if (!supabaseClient || !supabaseClient.rpc) {
      return { valid: false, message: 'Supabase client is not initialized' };
    }
    
    const start = performance.now();
    const { data, error } = await supabaseClient.rpc('postgres_version');
    const duration = performance.now() - start;
    
    if (error) {
      return { valid: false, message: error.message, error };
    }
    
    return { 
      valid: true, 
      message: 'Connection successful', 
      version: data,
      responseTime: Math.round(duration)
    };
  } catch (e: any) {
    return { valid: false, message: e.message, error: e };
  }
};
