
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type KpiStatus = 'success' | 'warning' | 'danger';
type TrendDirection = 'up' | 'down' | 'neutral';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  status?: KpiStatus;
  trend?: TrendDirection;
  icon?: React.ReactNode | string;
  isLoading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  status = 'success',
  trend,
  icon,
  isLoading = false,
}) => {
  const renderChange = () => {
    if (change === undefined && !trend) return null;
    
    let isPositive;
    if (change !== undefined) {
      isPositive = change > 0;
    } else {
      isPositive = trend === 'up';
    }
    
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const statusColor = status === 'success' ? 'text-success' : 
                        status === 'warning' ? 'text-warning' : 'text-destructive';
    const changeColor = isPositive ? 'text-success' : 'text-destructive';
    
    if (trend === 'neutral') return null;
    
    return (
      <div className={`flex items-center ${changeColor}`}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        {change !== undefined && <span className="text-xs sm:text-sm">{Math.abs(change)}%</span>}
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
            className={`relative overflow-hidden transition-all hover:shadow-md border-l-4 h-full ${isLoading ? 'opacity-70' : ''}`} 
            style={{ borderLeftColor: getBorderColor() }}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</h3>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">{value}</div>
                  {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
                  {renderChange()}
                </div>
                {icon && (
                  <div className="bg-primary/10 p-1 sm:p-2 rounded-full">
                    {typeof icon === 'string' ? icon : icon}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
          {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KpiCard;
