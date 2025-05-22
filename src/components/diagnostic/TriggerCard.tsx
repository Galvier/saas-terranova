
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { CustomBadge } from '@/components/ui/custom-badge';

interface TriggerCardProps {
  syncStatus: any;
  isLoading: boolean;
}

export function TriggerCard({ syncStatus, isLoading }: TriggerCardProps) {
  const hasAuthTrigger = syncStatus?.details?.auth_triggers > 0;
  const hasManagerTrigger = syncStatus?.details?.manager_triggers > 0;
  const syncedUsersCount = syncStatus?.details?.synced_users_count || 0;
  const managersCount = syncStatus?.details?.managers_count || 0;
  const syncRatio = managersCount > 0 ? (syncedUsersCount / managersCount) * 100 : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <RefreshCw className="mr-2 h-5 w-5" />
          Status de Sincronização
        </CardTitle>
        <CardDescription>
          Verificação dos triggers entre auth.users e managers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Trigger auth_user:</span>
              <CustomBadge 
                variant={hasAuthTrigger ? "success" : "destructive"}
                className="flex items-center"
              >
                {hasAuthTrigger ? (
                  <><CheckCircle className="mr-1 h-3 w-3" /> Ativo</>
                ) : (
                  <><AlertCircle className="mr-1 h-3 w-3" /> Inativo</>
                )}
              </CustomBadge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Trigger manager:</span>
              <CustomBadge 
                variant={hasManagerTrigger ? "success" : "destructive"}
                className="flex items-center"
              >
                {hasManagerTrigger ? (
                  <><CheckCircle className="mr-1 h-3 w-3" /> Ativo</>
                ) : (
                  <><AlertCircle className="mr-1 h-3 w-3" /> Inativo</>
                )}
              </CustomBadge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Managers sincronizados:</span>
              <span className="text-sm">
                {syncedUsersCount} / {managersCount} ({syncRatio.toFixed(0)}%)
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <CustomBadge 
                variant={hasAuthTrigger && hasManagerTrigger && syncedUsersCount === managersCount ? "success" : "destructive"}
              >
                {hasAuthTrigger && hasManagerTrigger && syncedUsersCount === managersCount ? 
                  'Saudável' : 
                  syncedUsersCount < managersCount ? 
                    'Usuários não sincronizados' : 
                    'Problema detectado'
                }
              </CustomBadge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
