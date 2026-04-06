import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ message = "Ocorreu um erro.", onRetry, retryLabel = "Tentar novamente" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center" data-testid="error-state">
      <AlertCircle className="text-destructive" size={36} />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
