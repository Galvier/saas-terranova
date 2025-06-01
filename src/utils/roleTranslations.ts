
// Helper para traduzir funções/roles do inglês para português
export const translateRole = (role: string): string => {
  const roleTranslations: Record<string, string> = {
    'admin': 'Administrador',
    'manager': 'Gestor',
    'viewer': 'Visualizador',
    'gestor': 'Gestor', // Já em português
    'administrador': 'Administrador', // Já em português
    'visualizador': 'Visualizador' // Já em português
  };
  
  return roleTranslations[role?.toLowerCase()] || role || 'Gestor';
};

// Helper para traduzir nomes de templates
export const translateTemplateName = (name: string): string => {
  const templateTranslations: Record<string, string> = {
    'system_update': 'Atualização do Sistema',
    'maintenance': 'Manutenção',
    'alert': 'Alerta',
    'welcome': 'Boas-vindas',
    'reminder': 'Lembrete',
    'notification': 'Notificação',
    'announcement': 'Anúncio',
    'warning': 'Aviso',
    'info': 'Informação',
    'success': 'Sucesso',
    'error': 'Erro'
  };
  
  return templateTranslations[name?.toLowerCase()] || name;
};
