import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBusinessClient, useUpdateBusinessClient } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  companyName: z.string().min(1, "Razão Social é obrigatória"),
  tradeName: z.string().min(1, "Nome Fantasia é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  category: z.enum(["standard", "corporate", "enterprise"]),
  balance: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface Props { id: number }

export default function BusinessClientEdit({ id }: Props) {
  const { t } = useSettings();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: client, isLoading, isError, error, refetch } = useBusinessClient(id);
  const update = useUpdateBusinessClient(id);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: "", tradeName: "", cnpj: "", phone: "", email: "", category: "standard", balance: 0 },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        companyName: client.companyName,
        tradeName: client.tradeName,
        cnpj: client.cnpj,
        phone: client.phone ?? "",
        email: client.email ?? "",
        category: client.category,
        balance: client.balance,
      });
    }
  }, [client, form]);

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data);
      toast({ title: t.form.successUpdate });
      setLocation(`/clientes/pj/${id}`);
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title={t.form.edit} subtitle={client?.companyName} backHref={`/clientes/pj/${id}`} backLabel={t.form.back} />
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-pj-edit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>{t.form.companyName}</FormLabel><FormControl><Input {...field} data-testid="input-companyName" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tradeName" render={({ field }) => (
                  <FormItem><FormLabel>{t.form.tradeName}</FormLabel><FormControl><Input {...field} data-testid="input-tradeName" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cnpj" render={({ field }) => (
                  <FormItem><FormLabel>{t.form.cnpj}</FormLabel><FormControl><Input {...field} data-testid="input-cnpj" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>{t.form.phone}</FormLabel><FormControl><Input {...field} data-testid="input-phone" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>{t.form.email}</FormLabel><FormControl><Input type="email" {...field} data-testid="input-email" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.category}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="standard">{t.form.standard}</SelectItem>
                        <SelectItem value="corporate">{t.form.corporate}</SelectItem>
                        <SelectItem value="enterprise">{t.form.enterprise}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="balance" render={({ field }) => (
                  <FormItem><FormLabel>{t.form.balance}</FormLabel><FormControl><Input type="number" step="0.01" {...field} data-testid="input-balance" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" disabled={update.isPending} data-testid="button-submit">
                {update.isPending ? t.form.saving : t.form.save}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
