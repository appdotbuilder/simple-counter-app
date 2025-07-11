
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load counter on mount
  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleIncrement = async () => {
    if (!counter) return;
    
    setIsLoading(true);
    try {
      const result = await trpc.incrementCounter.mutate({ increment: 1 });
      setCounter(result);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!counter) return;
    
    setIsLoading(true);
    try {
      const result = await trpc.resetCounter.mutate({ value: 0 });
      setCounter(result);
    } catch (error) {
      console.error('Failed to reset counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!counter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading counter...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">Counter</h1>
          
          <div className="mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {counter.value}
            </div>
            <div className="text-sm text-gray-500">
              Updated: {counter.updated_at.toLocaleTimeString()}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleIncrement}
              disabled={isLoading}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isLoading ? 'Updating...' : 'Increment (+1)'}
            </Button>
            
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Reset to 0
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
