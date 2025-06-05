
import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Manager } from '@/integrations/supabase/types/manager';

interface ManagerMultiSelectProps {
  managers: Manager[];
  selectedManagerIds: string[];
  primaryManagerId: string | null;
  onSelectionChange: (managerIds: string[]) => void;
  onPrimaryChange: (managerId: string | null) => void;
  disabled?: boolean;
}

export const ManagerMultiSelect: React.FC<ManagerMultiSelectProps> = ({
  managers,
  selectedManagerIds,
  primaryManagerId,
  onSelectionChange,
  onPrimaryChange,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);

  const selectedManagers = managers.filter(manager => 
    selectedManagerIds.includes(manager.id)
  );

  const handleManagerToggle = (managerId: string) => {
    const newSelection = selectedManagerIds.includes(managerId)
      ? selectedManagerIds.filter(id => id !== managerId)
      : [...selectedManagerIds, managerId];
    
    onSelectionChange(newSelection);
    
    // Se removemos o gestor primário, limpar a seleção primária
    if (!newSelection.includes(primaryManagerId || '')) {
      onPrimaryChange(null);
    }
  };

  const handlePrimaryToggle = (managerId: string) => {
    // Se já é primário, remover. Senão, definir como primário
    const newPrimary = primaryManagerId === managerId ? null : managerId;
    onPrimaryChange(newPrimary);
  };

  const removeManager = (managerId: string) => {
    const newSelection = selectedManagerIds.filter(id => id !== managerId);
    onSelectionChange(newSelection);
    
    if (primaryManagerId === managerId) {
      onPrimaryChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Gestores Responsáveis</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedManagerIds.length === 0 
              ? "Selecione gestores..." 
              : `${selectedManagerIds.length} gestor(es) selecionado(s)`
            }
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar gestores..." />
            <CommandList>
              <CommandEmpty>Nenhum gestor encontrado.</CommandEmpty>
              <CommandGroup>
                {managers.filter(manager => manager.is_active).map((manager) => (
                  <CommandItem
                    key={manager.id}
                    onSelect={() => handleManagerToggle(manager.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedManagerIds.includes(manager.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{manager.name}</div>
                        <div className="text-sm text-muted-foreground">{manager.email}</div>
                      </div>
                    </div>
                    
                    {selectedManagerIds.includes(manager.id) && (
                      <Button
                        variant={primaryManagerId === manager.id ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrimaryToggle(manager.id);
                        }}
                        className="ml-2"
                      >
                        {primaryManagerId === manager.id ? "Primário" : "Tornar Primário"}
                      </Button>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Lista de gestores selecionados */}
      {selectedManagers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedManagers.map((manager) => (
            <Badge
              key={manager.id}
              variant={primaryManagerId === manager.id ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {manager.name}
              {primaryManagerId === manager.id && (
                <span className="text-xs">(Primário)</span>
              )}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeManager(manager.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
