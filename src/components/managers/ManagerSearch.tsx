
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ManagerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ManagerSearch = ({ searchTerm, onSearchChange }: ManagerSearchProps) => {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        placeholder="Buscar gestores..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-[300px]"
      />
      <Button variant="secondary" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};
