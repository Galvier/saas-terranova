
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { callRPC } from '@/integrations/supabase/core';
import { AlertCircle, CheckCircle, Code, Loader2 } from 'lucide-react';
import { CustomBadge } from '@/components/ui/custom-badge';

interface DbFunctionTesterProps {
  functionName: string;
  defaultParams?: any;
  onResult?: (result: any) => void;
}

const DbFunctionTester: React.FC<DbFunctionTesterProps> = ({ 
  functionName, 
  defaultParams = {}, 
  onResult 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testFunction = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const startTime = performance.now();
      
      // Make the RPC call
      const { data, error } = await callRPC(functionName as any, defaultParams);
      
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      
      if (error) {
        setError(error.message || 'Unknown error');
      } else {
        setResult(data);
        if (onResult) onResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Code className="mr-2 h-4 w-4" />
          Test Function: <span className="ml-1 text-primary">{functionName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 text-xs">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Parameters:</span>
            <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(defaultParams, null, 2)}
            </pre>
          </div>
          
          {(result !== null || error) && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">Status:</span>
                {error ? (
                  <CustomBadge variant="destructive" className="text-xs py-0 h-5">
                    <AlertCircle className="mr-1 h-3 w-3" /> Failed
                  </CustomBadge>
                ) : (
                  <CustomBadge variant="success" className="text-xs py-0 h-5">
                    <CheckCircle className="mr-1 h-3 w-3" /> Success
                  </CustomBadge>
                )}
                {responseTime !== null && (
                  <span className="text-xs text-muted-foreground">({responseTime}ms)</span>
                )}
              </div>
              
              {error && (
                <div className="mt-1">
                  <span className="font-semibold">Error:</span>
                  <div className="mt-1 bg-destructive/10 text-destructive p-2 rounded text-xs overflow-x-auto">
                    {error}
                  </div>
                </div>
              )}
              
              {result !== null && (
                <div className="mt-1">
                  <span className="font-semibold">Result:</span>
                  <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          onClick={testFunction} 
          size="sm" 
          variant="outline" 
          className="w-full text-xs"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Function'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DbFunctionTester;
