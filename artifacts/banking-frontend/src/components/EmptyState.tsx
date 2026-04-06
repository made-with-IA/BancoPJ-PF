import { Users } from "lucide-react";

interface Props {
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message = "Nenhum resultado encontrado.", icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center" data-testid="empty-state">
      {icon ?? <Users size={36} className="text-muted-foreground/50" />}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
