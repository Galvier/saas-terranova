
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type KpiStatus = 'success' | 'warning' | 'danger';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  status?: KpiStatus;
  icon?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  status = 'success',
  icon,
}) => {
  const renderChange = () => {
    // Don't render change if it's undefined or null
    if (change === undefined || change === null) return null;
    
    const isPositive = change > 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const changeColor = isPositive ? 'text-success' : 'text-destructive';
    
    return (
      <div className={`flex items-center ${changeColor} mt-2`}>
        <Icon className="w-3 h-3 mr-1" />
        <span className="text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
        {changeLabel && <span className="ml-1 text-muted-foreground text-xs hidden sm:inline">{changeLabel}</span>}
      </div>
    );
  };

  const getBorderColor = () => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--destructive)';
      default: return 'var(--success)';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className="relative overflow-hidden transition-all hover:shadow-md border-l-4 aspect-[3/2] touch-manipulation" 
            style={{ borderLeftColor: getBorderColor() }}
          >
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-muted-foreground line-clamp-2 flex-1 mr-2">
                  {title}
                </h3>
                {icon && (
                  <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                    <div className="w-4 h-4">
                      {icon}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-xl font-bold mb-1 break-words">
                  {value}
                </div>
                {renderChange()}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
          {changeLabel && change !== undefined && <p className="text-muted-foreground text-xs">{changeLabel}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KpiCard;
