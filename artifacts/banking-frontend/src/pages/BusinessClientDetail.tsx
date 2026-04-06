import { Link } from "wouter";
import { Edit, ArrowDownToLine, FileText, Wallet, Building2, Mail, Phone, Calendar, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBusinessClient } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency, formatDate, formatCNPJ } from "@/utils/formatters";
import { CategoryBadge } from "@/components/CategoryBadge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";

interface Props {
  id: number;
}

export default function BusinessClientDetail({ id }: Props) {
  const { t, settings } = useSettings();
  const { data: client, isLoading, isError, error, refetch } = useBusinessClient(id);

  if (isLoading) return <LoadingState label={t.common.loading} />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? t.common.error} onRetry={() => refetch()} />;
  if (!client) return null;

  return (
    <div>
      <PageHeader
        title={client.companyName}
        subtitle={`Nome Fantasia: ${client.tradeName}`}
        backHref="/clientes"
        backLabel={t.common.back}
        actions={
          <>
            <Link href={`/clientes/pj/${id}/editar`}>
              <Button variant="outline" size="sm" data-testid="button-edit">
                <Edit size={14} className="mr-1" /> {t.clients.edit}
              </Button>
            </Link>
            <Link href={`/clientes/pj/${id}/saque`}>
              <Button variant="outline" size="sm" data-testid="button-withdraw">
                <ArrowDownToLine size={14} className="mr-1" /> {t.clients.withdraw}
              </Button>
            </Link>
            <Link href={`/clientes/pj/${id}/extrato`}>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Dados da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Razão Social</p>
                <p className="font-medium" data-testid="text-client-companyName">{client.companyName}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Nome Fantasia</p>
                <p className="font-medium" data-testid="text-client-tradeName">{client.tradeName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.clients.category}</p>
                <CategoryBadge category={client.category} type="business" />
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p className="font-mono font-medium" data-testid="text-client-cnpj">{formatCNPJ(client.cnpj)}</p>
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
              <Wallet size={16} className="text-purple-600" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600" data-testid="text-client-balance">
              {formatCurrency(client.balance, settings ?? undefined)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Limite de saque: {formatCurrency(5000, settings ?? undefined)}/op.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
