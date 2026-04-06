import { Loader2 } from "lucide-react";

interface Props {
  label?: string;
}

export function LoadingState({ label = "Carregando..." }: Props) {
  return (
    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground" data-testid="loading-state">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
