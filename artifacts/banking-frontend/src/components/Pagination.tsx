import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  ofLabel?: string;
}

export function Pagination({ page, totalPages, onPageChange, label = "Página", ofLabel = "de" }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-end mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        data-testid="button-page-prev"
      >
        <ChevronLeft size={16} />
      </Button>
      <span className="text-sm text-muted-foreground" data-testid="text-page-info">
        {label} {page} {ofLabel} {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        data-testid="button-page-next"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
