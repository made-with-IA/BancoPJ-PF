import { Link } from "wouter";
import { Edit, ArrowDownToLine, FileText, Wallet, User, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIndividualClient } from "@/hooks/useIndividualClients";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { CategoryBadge } from "@/components/CategoryBadge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";

interface Props {
  id: number;
}

export default function IndividualClientDetail({ id }: Props) {
  const { t, settings } = useSettings();
  const { data: client, isLoading, isError, error, refetch } = useIndividualClient(id);

  if (isLoading) return <LoadingState label={t.common.loading} />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? t.common.error} onRetry={() => refetch()} />;
  if (!client) return null;

  return (
    <div>
      <PageHeader
        title={client.fullName}
        subtitle="Pessoa Física"
        backHref="/clientes"
        backLabel={t.common.back}
        actions={
          <>
            <Link href={`/clientes/pf/${id}/editar`}>
              <Button variant="outline" size="sm" data-testid="button-edit">
                <Edit size={14} className="mr-1" /> {t.clients.edit}
              </Button>
            </Link>
            <Link href={`/clientes/pf/${id}/saque`}>
              <Button variant="outline" size="sm" data-testid="button-withdraw">
                <ArrowDownToLine size={14} className="mr-1" /> {t.clients.withdraw}
              </Button>
            </Link>
            <Link href={`/clientes/pf/${id}/extrato`}>
              <Button size="sm" data-testid="button-statement">
                <FileText size={14} className="mr-1" /> {t.clients.statement}
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium" data-testid="text-client-name">{client.fullName}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Idade</p>
                <p className="font-medium" data-testid="text-client-age">{client.age} anos</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.clients.category}</p>
                <CategoryBadge category={client.category} type="individual" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.clients.monthlyIncome}</p>
                <p className="font-medium" data-testid="text-client-income">{formatCurrency(client.monthlyIncome, settings ?? undefined)}</p>
              </div>
            </div>
            <Separator />
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p data-testid="text-client-email">{client.email}</p>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p data-testid="text-client-phone">{client.phone}</p>
                </div>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{t.common.createdAt}: {formatDate(client.createdAt, settings ?? undefined)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{t.common.updatedAt}: {formatDate(client.updatedAt, settings ?? undefined)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet size={16} className="text-green-600" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600" data-testid="text-client-balance">
              {formatCurrency(client.balance, settings ?? undefined)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Limite de saque: {formatCurrency(1000, settings ?? undefined)}/op.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
