
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChartLine, Gauge, Thermometer, Activity, TrendingUp, TrendingDown, 
  CircleArrowUp, CircleArrowDown, DollarSign, Euro, Receipt, 
  PiggyBank, CreditCard, ShoppingCart, Users, Tag, 
  Percent, Target, Megaphone, Briefcase, Settings, Timer,
  FileBarChart, CalendarCheck, ChartArea, ChartBar, ChartPie,
  ChartColumn, ChartSpline, ChartScatter, ChartNoAxesColumn,
  ChartBarStacked, ChartColumnStacked
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type IconCategory = 'general' | 'financial' | 'commercial' | 'operations' | 'hr' | 'marketing' | 'charts';

interface IconDefinition {
  name: string;
  component: React.ComponentType<any>;
  category: IconCategory;
}

const icons: IconDefinition[] = [
  // Charts
  { name: 'chart-line', component: ChartLine, category: 'charts' },
  { name: 'chart-bar', component: ChartBar, category: 'charts' },
  { name: 'chart-area', component: ChartArea, category: 'charts' },
  { name: 'chart-pie', component: ChartPie, category: 'charts' },
  { name: 'chart-column', component: ChartColumn, category: 'charts' },
  { name: 'chart-spline', component: ChartSpline, category: 'charts' },
  { name: 'chart-scatter', component: ChartScatter, category: 'charts' },
  { name: 'chart-no-axes-column', component: ChartNoAxesColumn, category: 'charts' },
  { name: 'chart-bar-stacked', component: ChartBarStacked, category: 'charts' },
  { name: 'chart-column-stacked', component: ChartColumnStacked, category: 'charts' },
  
  // General
  { name: 'gauge', component: Gauge, category: 'general' },
  { name: 'thermometer', component: Thermometer, category: 'general' },
  { name: 'activity', component: Activity, category: 'general' },
  { name: 'trending-up', component: TrendingUp, category: 'general' },
  { name: 'trending-down', component: TrendingDown, category: 'general' },
  { name: 'circle-arrow-up', component: CircleArrowUp, category: 'general' },
  { name: 'circle-arrow-down', component: CircleArrowDown, category: 'general' },
  
  // Financial
  { name: 'dollar-sign', component: DollarSign, category: 'financial' },
  { name: 'euro', component: Euro, category: 'financial' },
  { name: 'receipt', component: Receipt, category: 'financial' },
  { name: 'piggy-bank', component: PiggyBank, category: 'financial' },
  { name: 'credit-card', component: CreditCard, category: 'financial' },
  
  // Commercial
  { name: 'shopping-cart', component: ShoppingCart, category: 'commercial' },
  { name: 'users', component: Users, category: 'commercial' },
  { name: 'tag', component: Tag, category: 'commercial' },
  { name: 'percent', component: Percent, category: 'commercial' },
  
  // Marketing
  { name: 'target', component: Target, category: 'marketing' },
  { name: 'megaphone', component: Megaphone, category: 'marketing' },
  
  // HR
  { name: 'briefcase', component: Briefcase, category: 'hr' },
  
  // Operations
  { name: 'settings', component: Settings, category: 'operations' },
  { name: 'timer', component: Timer, category: 'operations' },
  { name: 'file-bar-chart', component: FileBarChart, category: 'operations' },
  { name: 'calendar-check', component: CalendarCheck, category: 'operations' }
];

export type MetricIcon = typeof icons[number]['name'];

interface IconSelectProps {
  value: MetricIcon;
  onChange: (value: MetricIcon) => void;
}

export const IconSelect: React.FC<IconSelectProps> = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedIcon = icons.find(icon => icon.name === value) || icons[0];
  const IconComponent = selectedIcon.component;
  
  const filteredIcons = searchQuery
    ? icons.filter(icon => 
        icon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        icon.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : icons;
    
  const getIconsByCategory = (category: IconCategory) => {
    return filteredIcons.filter(icon => icon.category === category);
  };
  
  const formatName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[240px] justify-start"
        >
          <IconComponent className="mr-2 h-4 w-4" />
          {value ? formatName(value) : 'Selecionar um ícone'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <div className="p-2">
          <Input 
            placeholder="Pesquisar ícones..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start px-2 pt-2 flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">Gráficos</TabsTrigger>
            <TabsTrigger value="general" className="text-xs">Geral</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="commercial" className="text-xs">Comercial</TabsTrigger>
            <TabsTrigger value="operations" className="text-xs">Operações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-6 gap-2 p-2 max-h-64 overflow-y-auto">
              {filteredIcons.map((icon) => {
                const Icon = icon.component;
                return (
                  <Button
                    key={icon.name}
                    variant="ghost"
                    className="flex h-9 w-9 p-0 justify-center items-center data-[state=selected]:bg-muted"
                    onClick={() => onChange(icon.name)}
                    data-state={value === icon.name ? 'selected' : 'idle'}
                    title={formatName(icon.name)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </TabsContent>
          
          {['charts', 'general', 'financial', 'commercial', 'marketing', 'hr', 'operations'].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-6 gap-2 p-2 max-h-64 overflow-y-auto">
                {getIconsByCategory(category as IconCategory).map((icon) => {
                  const Icon = icon.component;
                  return (
                    <Button
                      key={icon.name}
                      variant="ghost"
                      className="flex h-9 w-9 p-0 justify-center items-center data-[state=selected]:bg-muted"
                      onClick={() => onChange(icon.name)}
                      data-state={value === icon.name ? 'selected' : 'idle'}
                      title={formatName(icon.name)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
