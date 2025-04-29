
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutDashboard, Star } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface DashboardToggleProps {
  viewMode: 'all' | 'favorites';
  onViewModeChange: (mode: 'all' | 'favorites') => void;
}

const DashboardToggle: React.FC<DashboardToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <TooltipProvider>
      <ToggleGroup 
        type="single" 
        value={viewMode} 
        onValueChange={(value) => value && onViewModeChange(value as 'all' | 'favorites')}
        className="border rounded-md"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="favorites" 
              aria-label="Ver métricas principais"
              className={`${viewMode === 'favorites' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Star className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Principais</span>
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Ver métricas principais</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="all" 
              aria-label="Ver todas as métricas"
              className={`${viewMode === 'all' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Completo</span>
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Ver todas as métricas</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
};

export default DashboardToggle;
