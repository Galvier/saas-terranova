
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
      <div className={`flex items-center ${changeColor} mt-2 md:mt-1`}>
        <Icon className="w-4 h-4 md:w-3 md:h-3 mr-1" />
        <span className="text-sm md:text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
        {changeLabel && <span className="ml-1 text-muted-foreground text-xs hidden lg:inline">{changeLabel}</span>}
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
            className="relative overflow-hidden transition-all hover:shadow-lg md:hover:shadow-md border-l-4 h-full min-h-[120px] md:min-h-[100px] touch-manipulation" 
            style={{ borderLeftColor: getBorderColor() }}
          >
            <CardContent className="p-4 md:p-3 lg:p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-xs lg:text-sm font-medium text-muted-foreground line-clamp-2 mb-2 md:mb-1">
                    {title}
                  </h3>
                  <div className="text-2xl md:text-xl lg:text-2xl font-bold mb-1 break-words">
                    {value}
                  </div>
                  {renderChange()}
                </div>
                {icon && (
                  <div className="bg-primary/10 p-2 md:p-1.5 lg:p-2 rounded-full ml-2 flex-shrink-0">
                    <div className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5">
                      {icon}
                    </div>
                  </div>
                )}
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
