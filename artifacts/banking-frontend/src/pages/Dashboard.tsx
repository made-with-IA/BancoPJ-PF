import { Link } from "wouter";
import { Users, Building2, TrendingUp, PlusCircle, ArrowRight, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndividualClients } from "@/hooks/useIndividualClients";
import { useBusinessClients } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency } from "@/utils/formatters";

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  color = "text-primary",
  testId,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isLoading: boolean;
  color?: string;
  testId: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon size={16} className={color} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="text-2xl font-bold" data-testid={testId}>{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { t, settings } = useSettings();
  const { data: pfData, isLoading: pfLoading } = useIndividualClients({ limit: 999 });
  const { data: pjData, isLoading: pjLoading } = useBusinessClients({ limit: 999 });

  const pfTotal = pfData?.total ?? 0;
  const pjTotal = pjData?.total ?? 0;
  const pfBalance = pfData?.data.reduce((s, c) => s + c.balance, 0) ?? 0;
  const pjBalance = pjData?.data.reduce((s, c) => s + c.balance, 0) ?? 0;

  const recentPF = pfData?.data.slice(0, 5) ?? [];
  const recentPJ = pjData?.data.slice(0, 5) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral do sistema bancário</p>
        </div>
        <Link href="/clientes/novo">
          <Button data-testid="button-new-client">
            <PlusCircle size={16} className="mr-2" />
            {t.dashboard.newClient}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label={t.dashboard.totalPF} value={String(pfTotal)} isLoading={pfLoading} testId="stat-pf-total" />
        <StatCard icon={Building2} label={t.dashboard.totalPJ} value={String(pjTotal)} isLoading={pjLoading} color="text-purple-600" testId="stat-pj-total" />
        <StatCard icon={Wallet} label={t.dashboard.balancePF} value={formatCurrency(pfBalance, settings ?? undefined)} isLoading={pfLoading} color="text-green-600" testId="stat-pf-balance" />
        <StatCard icon={TrendingUp} label={t.dashboard.balancePJ} value={formatCurrency(pjBalance, settings ?? undefined)} isLoading={pjLoading} color="text-amber-600" testId="stat-pj-balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Últimos Clientes PF
            </CardTitle>
            <Link href="/clientes">
              <Button variant="ghost" size="sm" className="text-xs" data-testid="link-view-all-pf">
                {t.dashboard.viewAll}
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {pfLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentPF.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum cliente PF cadastrado.</p>
            ) : (
              <div className="space-y-1">
                {recentPF.map((c) => (
                  <Link key={c.id} href={`/clientes/pf/${c.id}`}>
                    <div
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      data-testid={`row-pf-${c.id}`}
                    >
                      <div>
                        <p className="text-sm font-medium">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <p className="text-sm font-semibold text-green-600" data-testid={`text-pf-balance-${c.id}`}>
                        {formatCurrency(c.balance, settings ?? undefined)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 size={16} className="text-purple-600" />
              Últimos Clientes PJ
            </CardTitle>
            <Link href="/clientes">
              <Button variant="ghost" size="sm" className="text-xs" data-testid="link-view-all-pj">
                {t.dashboard.viewAll}
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {pjLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentPJ.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum cliente PJ cadastrado.</p>
            ) : (
              <div className="space-y-1">
                {recentPJ.map((c) => (
                  <Link key={c.id} href={`/clientes/pj/${c.id}`}>
                    <div
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      data-testid={`row-pj-${c.id}`}
                    >
                      <div>
                        <p className="text-sm font-medium">{c.companyName}</p>
                        <p className="text-xs text-muted-foreground">{c.tradeName}</p>
                      </div>
                      <p className="text-sm font-semibold text-purple-600" data-testid={`text-pj-balance-${c.id}`}>
                        {formatCurrency(c.balance, settings ?? undefined)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
