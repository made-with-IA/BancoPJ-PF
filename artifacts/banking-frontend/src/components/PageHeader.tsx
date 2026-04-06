import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref, backLabel = "Voltar", actions }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {backHref && (
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" data-testid="button-back">
              <ChevronLeft size={16} className="mr-1" />
              {backLabel}
            </Button>
          </Link>
        )}
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 mt-1">{actions}</div>}
    </div>
  );
}
