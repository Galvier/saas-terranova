
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronUp, ChevronDown, BarChart, TrendingUp, CircleDollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

// Simulated data
const initialMetrics = [
  { 
    id: 1, 
    name: 'Taxa de Conversão', 
    description: 'Porcentagem de leads convertidos em vendas', 
    target: 15, 
    current: 12.3, 
    unit: '%', 
    department: 'Vendas',
    frequency: 'weekly',
    trend: 'up',
    status: 'warning'
  },
  { 
    id: 2, 
    name: 'Receita Mensal', 
    description: 'Receita total gerada no mês', 
    target: 250000, 
    current: 275450, 
    unit: 'R$', 
    department: 'Financeiro',
    frequency: 'monthly',
    trend: 'up',
    status: 'success'
  },
  { 
    id: 3, 
    name: 'Tempo Médio de Resposta', 
    description: 'Tempo médio para responder tickets de suporte', 
    target: 4, 
    current: 6.2, 
    unit: 'horas', 
    department: 'Suporte',
    frequency: 'daily',
    trend: 'down',
    status: 'danger'
  },
  { 
    id: 4, 
    name: 'Custo de Aquisição', 
    description: 'Custo médio para adquirir um novo cliente', 
    target: 200, 
    current: 185, 
    unit: 'R$', 
    department: 'Marketing',
    frequency: 'monthly',
    trend: 'down',
    status: 'success'
  },
  { 
    id: 5, 
    name: 'Rotatividade de Funcionários', 
    description: 'Taxa de rotatividade mensal', 
    target: 5, 
    current: 4.8, 
    unit: '%', 
    department: 'RH',
    frequency: 'monthly',
    trend: 'up',
    status: 'success'
  },
];

const departmentOptions = [
  'Vendas', 'Marketing', 'Financeiro', 'RH', 'TI', 'Operações', 'Logística', 'Suporte', 'Jurídico'
];

const frequencyOptions = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
];

const unitOptions = [
  '%', 'R$', 'unidades', 'horas', 'dias', 'pontos', 'clientes'
];

const Metrics = () => {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: '',
    description: '',
    target: '',
    unit: '',
    department: '',
    frequency: 'monthly',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = metrics.length + 1;
    const metricToAdd = {
      ...newMetric,
      id,
      current: 0,
      trend: 'neutral',
      status: 'warning'
    };
    
    setMetrics([...metrics, metricToAdd]);
    setIsDialogOpen(false);
    
    toast({
      title: "Métrica adicionada",
      description: `${newMetric.name} foi adicionada com sucesso`,
    });
    
    // Reset form
    setNewMetric({
      name: '',
      description: '',
      target: '',
      unit: '',
      department: '',
      frequency: 'monthly',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return null;
    }
  };

  const getMetricIcon = (department: string) => {
    switch (department) {
      case 'Vendas':
        return <BarChart className="h-4 w-4" />;
      case 'Financeiro':
        return <CircleDollarSign className="h-4 w-4" />;
      case 'Suporte':
      case 'RH':
        return <Clock className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') {
      return `${unit} ${value.toLocaleString('pt-BR')}`;
    }
    return `${value}${unit}`;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Métricas" subtitle="Gerencie as métricas de desempenho da empresa" />
      
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Métrica
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Criar Métrica</DialogTitle>
                <DialogDescription>
                  Adicione uma nova métrica de desempenho.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Métrica</Label>
                  <Input 
                    id="name" 
                    value={newMetric.name}
                    onChange={e => setNewMetric({...newMetric, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    value={newMetric.description}
                    onChange={e => setNewMetric({...newMetric, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Meta</Label>
                    <Input 
                      id="target" 
                      type="number"
                      value={newMetric.target}
                      onChange={e => setNewMetric({...newMetric, target: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Select 
                      onValueChange={value => setNewMetric({...newMetric, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select 
                    onValueChange={value => setNewMetric({...newMetric, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequência de Atualização</Label>
                  <RadioGroup 
                    defaultValue={newMetric.frequency}
                    onValueChange={value => setNewMetric({...newMetric, frequency: value})}
                    className="flex flex-wrap gap-4"
                  >
                    {frequencyOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead className="text-right">Meta</TableHead>
              <TableHead className="text-right">Atual</TableHead>
              <TableHead className="text-center">Tendência</TableHead>
              <TableHead className="text-center">Frequência</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted rounded-full p-1">
                      {getMetricIcon(metric.department)}
                    </div>
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-xs text-muted-foreground">{metric.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{metric.department}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatValue(metric.target, metric.unit)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatValue(metric.current, metric.unit)}
                </TableCell>
                <TableCell className="text-center">
                  {metric.trend === 'up' ? (
                    <ChevronUp className={`h-5 w-5 ${metric.status === 'success' ? 'text-success' : 'text-danger'}`} />
                  ) : (
                    <ChevronDown className={`h-5 w-5 ${metric.status === 'success' ? 'text-success' : 'text-danger'}`} />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {frequencyOptions.find(opt => opt.value === metric.frequency)?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      metric.status === 'success' 
                        ? 'default' 
                        : metric.status === 'warning' 
                          ? 'secondary' 
                          : 'destructive'
                    }
                    className="flex items-center gap-1 mx-auto w-fit"
                  >
                    {getStatusIcon(metric.status)}
                    <span>
                      {metric.status === 'success' 
                        ? 'Bom' 
                        : metric.status === 'warning' 
                          ? 'Atenção' 
                          : 'Crítico'}
                    </span>
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Metrics;
