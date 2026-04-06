import { Badge } from "@/components/ui/badge";
import type { ClientCategory, BusinessCategory } from "@/types";

const individualColors: Record<ClientCategory, string> = {
  standard: "bg-slate-100 text-slate-700 border-slate-200",
  premium: "bg-blue-50 text-blue-700 border-blue-200",
  vip: "bg-amber-50 text-amber-700 border-amber-200",
};

const businessColors: Record<BusinessCategory, string> = {
  standard: "bg-slate-100 text-slate-700 border-slate-200",
  corporate: "bg-purple-50 text-purple-700 border-purple-200",
  enterprise: "bg-green-50 text-green-700 border-green-200",
};

const labels: Record<string, string> = {
  standard: "Padrão",
  premium: "Premium",
  vip: "VIP",
  corporate: "Corporativo",
  enterprise: "Empresarial",
};

interface Props {
  category: ClientCategory | BusinessCategory;
  type?: "individual" | "business";
}

export function CategoryBadge({ category, type = "individual" }: Props) {
  const colorMap = type === "business" ? businessColors : individualColors;
  const color = (colorMap as Record<string, string>)[category] ?? "bg-gray-100 text-gray-700";
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${color}`}
      data-testid={`badge-category-${category}`}
    >
      {labels[category] ?? category}
    </Badge>
  );
}
