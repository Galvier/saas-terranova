
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ManagerActions = () => {
  const navigate = useNavigate();
  
  const handleAddManager = () => {
    navigate('/managers/new');
  };

  return (
    <Button variant="outline" onClick={handleAddManager}>
      <Plus className="mr-2 h-4 w-4" />
      Adicionar
    </Button>
  );
};
