import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSettings } from "@/context/SettingsContext";
import { useUpdateSettings } from "@/hooks/useSettings";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon } from "lucide-react";

const schema = z.object({
  language: z.enum(["pt", "en"]),
  currencyFormat: z.enum(["BRL", "USD", "EUR"]),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { t, settings, refresh } = useSettings();
  const { toast } = useToast();
  const update = useUpdateSettings(refresh);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      language: "pt",
      currencyFormat: "BRL",
      dateFormat: "DD/MM/YYYY",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        language: settings.language,
        currencyFormat: settings.currencyFormat,
        dateFormat: settings.dateFormat,
      });
    }
  }, [settings, form]);

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data);
      toast({ title: t.settings.success });
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  return (
    <div>
      <PageHeader
        title={t.settings.title}
        subtitle="Preferências do sistema"
      />

      <div className="max-w-lg">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <SettingsIcon size={16} className="text-primary" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-settings">
                <FormField control={form.control} name="language" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.settings.language}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pt">{t.settings.portuguese}</SelectItem>
                        <SelectItem value="en">{t.settings.english}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="currencyFormat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.settings.currencyFormat}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">BRL — Real Brasileiro</SelectItem>
                        <SelectItem value="USD">USD — Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR — Euro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dateFormat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.settings.dateFormat}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-date-format">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={update.isPending} data-testid="button-settings-save">
                  {update.isPending ? t.settings.saving : t.settings.save}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
