import { useData } from '@/contexts/DataContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface DataLoadingWrapperProps {
  children: React.ReactNode;
}

export function DataLoadingWrapper({ children }: DataLoadingWrapperProps) {
  const { isLoading, error, refreshData } = useData();

  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Carregando dados...</h2>
            <p className="text-sm text-muted-foreground">
              Conectando ao Supabase e sincronizando informações
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error alert if there's an error (but still render children with default data)
  if (error) {
    return (
      <div className="min-h-screen p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados do Supabase</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm">
              Não foi possível conectar ao Supabase. Usando dados padrão localmente.
            </p>
            <p className="text-xs text-muted-foreground">
              {error.message}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refreshData()}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Render children normally if everything is ok
  return <>{children}</>;
}

