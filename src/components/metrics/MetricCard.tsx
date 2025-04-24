
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetricDefinition } from '@/integrations/supabase';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  metric: MetricDefinition;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, onClick }) => {
  const progress = (metric.current / metric.target) * 100;
  const isCurrencyUnit = metric.unit === 'R$';
  
  return (
    <Card className="hover:bg-accent/5 cursor-pointer transition-colors" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{metric.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{metric.department_name || 'Sem departamento'}</p>
          </div>
          {metric.trend !== 'neutral' && (
            <div className={metric.status === 'success' ? 'text-success' : 'text-destructive'}>
              {metric.trend === 'up' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{isCurrencyUnit ? `R$ ${metric.current}` : `${metric.current} ${metric.unit}`}</span>
            <span className="text-muted-foreground">
              Meta: {isCurrencyUnit ? `R$ ${metric.target}` : `${metric.target} ${metric.unit}`}
            </span>
          </div>
          <Progress
            value={Math.min(progress, 100)}
            className={
              metric.status === 'success'
                ? 'bg-success/20 [&>[data-progress]]:bg-success'
                : metric.status === 'warning'
                ? 'bg-warning/20 [&>[data-progress]]:bg-warning'
                : 'bg-destructive/20 [&>[data-progress]]:bg-destructive'
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
