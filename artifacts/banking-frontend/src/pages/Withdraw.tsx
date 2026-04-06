import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useIndividualClient, useWithdrawIndividualClient } from "@/hooks/useIndividualClients";
import { useBusinessClient, useWithdrawBusinessClient } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency } from "@/utils/formatters";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownToLine } from "lucide-react";

interface Props {
  id: number;
  type: "pf" | "pj";
}

export default function Withdraw({ id, type }: Props) {
  const { t, settings } = useSettings();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const limit = type === "pf" ? 1000 : 5000;
  const backHref = `/clientes/${type}/${id}`;

  const pfQuery = useIndividualClient(type === "pf" ? id : 0);
  const pjQuery = useBusinessClient(type === "pj" ? id : 0);
  const query = type === "pf" ? pfQuery : pjQuery;

  const withdrawPF = useWithdrawIndividualClient(id);
  const withdrawPJ = useWithdrawBusinessClient(id);
  const withdraw = type === "pf" ? withdrawPF : withdrawPJ;

  const schema = z.object({
    amount: z.coerce.number().positive("Valor do saque deve ser maior que zero").max(limit, `Limite de saque: ${formatCurrency(limit, settings ?? undefined)}`),
    description: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, description: "" },
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await withdraw.mutateAsync({ amount: data.amount, description: data.description });
      toast({
        title: t.withdraw.success,
        description: `${t.withdraw.newBalance}: ${formatCurrency(result.newBalance, settings ?? undefined)}`,
      });
      setLocation(backHref);
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />;

  const client = query.data;
  const clientName = type === "pf"
    ? (client as { fullName: string }).fullName
    : (client as { companyName: string }).companyName;
  const balance = client?.balance ?? 0;

  return (
    <div>
      <PageHeader
        title={t.withdraw.title}
        subtitle={clientName}
        backHref={backHref}
        backLabel={t.withdraw.back}
      />

      <div className="max-w-lg">
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t.withdraw.currentBalance}</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-current-balance">
                  {formatCurrency(balance, settings ?? undefined)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t.withdraw.limit}</p>
                <p className="text-sm font-medium text-muted-foreground">{formatCurrency(limit, settings ?? undefined)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-withdraw">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.withdraw.amount}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" max={limit} {...field} data-testid="input-withdraw-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.withdraw.description}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-withdraw-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Separator />
                <Button type="submit" disabled={withdraw.isPending} className="w-full" data-testid="button-withdraw-submit">
                  <ArrowDownToLine size={16} className="mr-2" />
                  {withdraw.isPending ? t.withdraw.submitting : t.withdraw.submit}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
