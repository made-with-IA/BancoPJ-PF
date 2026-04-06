import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateIndividualClient } from "@/hooks/useIndividualClients";
import { useCreateBusinessClient } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";

const pfSchema = z.object({
  fullName: z.string().min(1, "Nome é obrigatório"),
  age: z.coerce.number().int().min(1, "Idade inválida").max(120, "Idade inválida"),
  monthlyIncome: z.coerce.number().min(0, "Renda mensal deve ser maior ou igual a zero"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  category: z.enum(["standard", "premium", "vip"]).default("standard"),
  balance: z.coerce.number().min(0, "Saldo deve ser maior ou igual a zero").default(0),
});

const pjSchema = z.object({
  companyName: z.string().min(1, "Razão Social é obrigatória"),
  tradeName: z.string().min(1, "Nome Fantasia é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório (mínimo 14 caracteres)"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  category: z.enum(["standard", "corporate", "enterprise"]).default("standard"),
  balance: z.coerce.number().min(0, "Saldo deve ser maior ou igual a zero").default(0),
});

type PFForm = z.infer<typeof pfSchema>;
type PJForm = z.infer<typeof pjSchema>;

function PFForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useSettings();
  const { toast } = useToast();
  const create = useCreateIndividualClient();
  const form = useForm<PFForm>({
    resolver: zodResolver(pfSchema),
    defaultValues: { fullName: "", age: 18, monthlyIncome: 0, phone: "", email: "", category: "standard", balance: 0 },
  });

  async function onSubmit(data: PFForm) {
    try {
      await create.mutateAsync(data);
      toast({ title: t.form.successCreate });
      onSuccess();
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-pf">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.fullName}</FormLabel>
              <FormControl><Input {...field} data-testid="input-pf-fullName" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="age" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.age}</FormLabel>
              <FormControl><Input type="number" {...field} data-testid="input-pf-age" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.monthlyIncome}</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} data-testid="input-pf-monthlyIncome" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.phone}</FormLabel>
              <FormControl><Input {...field} data-testid="input-pf-phone" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.email}</FormLabel>
              <FormControl><Input type="email" {...field} data-testid="input-pf-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.category}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-pf-category">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="standard">{t.form.standard}</SelectItem>
                  <SelectItem value="premium">{t.form.premium}</SelectItem>
                  <SelectItem value="vip">{t.form.vip}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="balance" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.balance}</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} data-testid="input-pf-balance" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="submit" disabled={create.isPending} data-testid="button-pf-submit">
          {create.isPending ? t.form.saving : t.form.save}
        </Button>
      </form>
    </Form>
  );
}

function PJForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useSettings();
  const { toast } = useToast();
  const create = useCreateBusinessClient();
  const form = useForm<PJForm>({
    resolver: zodResolver(pjSchema),
    defaultValues: { companyName: "", tradeName: "", cnpj: "", phone: "", email: "", category: "standard", balance: 0 },
  });

  async function onSubmit(data: PJForm) {
    try {
      await create.mutateAsync(data);
      toast({ title: t.form.successCreate });
      onSuccess();
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-pj">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="companyName" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.companyName}</FormLabel>
              <FormControl><Input {...field} data-testid="input-pj-companyName" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tradeName" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.tradeName}</FormLabel>
              <FormControl><Input {...field} data-testid="input-pj-tradeName" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cnpj" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.cnpj}</FormLabel>
              <FormControl><Input {...field} data-testid="input-pj-cnpj" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.phone}</FormLabel>
              <FormControl><Input {...field} data-testid="input-pj-phone" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.email}</FormLabel>
              <FormControl><Input type="email" {...field} data-testid="input-pj-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.category}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-pj-category">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
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
            <FormItem>
              <FormLabel>{t.form.balance}</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} data-testid="input-pj-balance" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="submit" disabled={create.isPending} data-testid="button-pj-submit">
          {create.isPending ? t.form.saving : t.form.save}
        </Button>
      </form>
    </Form>
  );
}

export default function ClientNew() {
  const { t } = useSettings();
  const [, setLocation] = useLocation();

  return (
    <div>
      <PageHeader title={t.form.create} backHref="/clientes" backLabel={t.form.back} />
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="pf">
            <TabsList className="mb-6">
              <TabsTrigger value="pf" data-testid="tab-new-pf">{t.clients.individual}</TabsTrigger>
              <TabsTrigger value="pj" data-testid="tab-new-pj">{t.clients.business}</TabsTrigger>
            </TabsList>
            <TabsContent value="pf">
              <PFForm onSuccess={() => setLocation("/clientes")} />
            </TabsContent>
            <TabsContent value="pj">
              <PJForm onSuccess={() => setLocation("/clientes")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
