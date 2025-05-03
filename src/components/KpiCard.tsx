
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, LineChart, BarChart3 } from 'lucide-react';
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
  departmentName?: string;
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
  departmentName,
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

  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      // Map string icons to actual components
      switch (icon) {
        case 'chart-line':
          return <LineChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
        case 'bar-chart':
          return <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
        default:
          // Try to render as text if not a known icon
          return <span className="text-primary">{icon}</span>;
      }
    }
    
    // If it's a React node, render it directly
    return icon;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`relative overflow-hidden transition-all hover:shadow-md border-l-4 h-full min-h-[180px] min-w-[280px] w-full ${isLoading ? 'opacity-70' : ''}`} 
            style={{ borderLeftColor: getBorderColor() }}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {departmentName && (
                      <div className="text-xs text-muted-foreground mb-1">{departmentName}</div>
                    )}
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</h3>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">{value}</div>
                    {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
                    {renderChange()}
                  </div>
                  {icon && (
                    <div className="bg-primary/10 p-1 sm:p-2 rounded-full">
                      {renderIcon()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
          {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
          {departmentName && <p className="text-muted-foreground text-xs">Setor: {departmentName}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KpiCard;
