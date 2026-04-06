import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndividualStatement } from "@/hooks/useIndividualClients";
import { useBusinessStatement } from "@/hooks/useBusinessClients";
import { useIndividualClient } from "@/hooks/useIndividualClients";
import { useBusinessClient } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { X } from "lucide-react";
import type { StatementFilters } from "@/types";

interface Props {
  id: number;
  type: "pf" | "pj";
}

export default function Statement({ id, type }: Props) {
  const { t, settings } = useSettings();
  const [page, setPage] = useState(1);
  const [transactionType, setTransactionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters: StatementFilters = { page, limit: 10, transactionType: transactionType || undefined, startDate: startDate || undefined, endDate: endDate || undefined };

  const pfClient = useIndividualClient(type === "pf" ? id : 0);
  const pjClient = useBusinessClient(type === "pj" ? id : 0);
  const pfStatement = useIndividualStatement(type === "pf" ? id : 0, filters);
  const pjStatement = useBusinessStatement(type === "pj" ? id : 0, filters);

  const clientQuery = type === "pf" ? pfClient : pjClient;
  const stmtQuery = type === "pf" ? pfStatement : pjStatement;

  const clientName = type === "pf"
    ? (clientQuery.data as { fullName?: string })?.fullName ?? ""
    : (clientQuery.data as { companyName?: string })?.companyName ?? "";

  function clearFilters() {
    setTransactionType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title={t.statement.title}
        subtitle={clientName}
        backHref={`/clientes/${type}/${id}`}
        backLabel={t.statement.back}
      />

      {stmtQuery.data && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t.statement.currentBalance}</p>
            <p className="text-2xl font-bold text-green-600" data-testid="text-current-balance">
              {formatCurrency(stmtQuery.data.currentBalance, settings ?? undefined)}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={transactionType || "all"} onValueChange={(v) => { setTransactionType(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-40" data-testid="select-statement-type">
                <SelectValue placeholder={t.statement.filterType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.statement.allTypes}</SelectItem>
                <SelectItem value="withdrawal">{t.statement.withdrawal}</SelectItem>
                <SelectItem value="deposit">{t.statement.deposit}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-40"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              placeholder={t.statement.startDate}
              data-testid="input-start-date"
            />
            <Input
              type="date"
              className="w-40"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              placeholder={t.statement.endDate}
              data-testid="input-end-date"
            />
            {(transactionType || startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                <X size={14} className="mr-1" /> {t.clients.clearFilters}
              </Button>
            )}
          </div>

          {stmtQuery.isError && (
            <ErrorState message={(stmtQuery.error as Error)?.message} onRetry={() => stmtQuery.refetch()} />
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.statement.date}</TableHead>
                  <TableHead>{t.statement.type}</TableHead>
                  <TableHead>{t.statement.description}</TableHead>
                  <TableHead className="text-right">{t.statement.amount}</TableHead>
                  <TableHead className="text-right">{t.statement.balance}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stmtQuery.isLoading && (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((__, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                    </TableRow>
                  ))
                )}
                {!stmtQuery.isLoading && stmtQuery.data?.transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyState message={t.statement.noResults} />
                    </TableCell>
                  </TableRow>
                )}
                {stmtQuery.data?.transactions.map((tx) => (
                  <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(tx.createdAt, settings ?? undefined)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={tx.transactionType === "withdrawal"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-green-50 text-green-700 border-green-200"
                        }
                        data-testid={`badge-tx-type-${tx.id}`}
                      >
                        {tx.transactionType === "withdrawal" ? t.statement.withdrawal : t.statement.deposit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{tx.description || "-"}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.transactionType === "withdrawal" ? "text-red-600" : "text-green-600"}`} data-testid={`text-tx-amount-${tx.id}`}>
                      {tx.transactionType === "withdrawal" ? "-" : "+"}{formatCurrency(tx.amount, settings ?? undefined)}
                    </TableCell>
                    <TableCell className="text-right text-sm" data-testid={`text-tx-balance-${tx.id}`}>
                      {formatCurrency(tx.newBalance, settings ?? undefined)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {stmtQuery.data && (
            <Pagination
              page={page}
              totalPages={stmtQuery.data.totalPages}
              onPageChange={setPage}
              label={t.clients.page}
              ofLabel={t.clients.of}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
