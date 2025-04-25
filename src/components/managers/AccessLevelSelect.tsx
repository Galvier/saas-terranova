
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccessLevelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AccessLevelSelect = ({ value, onChange }: AccessLevelSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="accessLevel">Nível de acesso</Label>
      <Select 
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o nível de acesso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="manager">Gestor</SelectItem>
          <SelectItem value="viewer">Visualizador</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Define as permissões do usuário no sistema
      </p>
    </div>
  );
};

export default AccessLevelSelect;

