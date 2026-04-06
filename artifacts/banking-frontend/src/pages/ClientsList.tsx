import { useState } from "react";
import { Link } from "wouter";
import { PlusCircle, Search, FileDown, Eye, Edit, ArrowDownToLine, FileText, Trash2, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndividualClients, useDeleteIndividualClient } from "@/hooks/useIndividualClients";
import { useBusinessClients, useDeleteBusinessClient } from "@/hooks/useBusinessClients";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency, formatCNPJ } from "@/utils/formatters";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const PF_CATEGORIES = ["standard", "premium", "vip"];
const PJ_CATEGORIES = ["standard", "corporate", "enterprise"];

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          {[...Array(cols)].map((__, j) => (
            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function ClientsList() {
  const { t, settings } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"pf" | "pj">("pf");

  const [pfPage, setPfPage] = useState(1);
  const [pfName, setPfName] = useState("");
  const [pfCategory, setPfCategory] = useState("");

  const [pjPage, setPjPage] = useState(1);
  const [pjName, setPjName] = useState("");
  const [pjCategory, setPjCategory] = useState("");

  const pfQuery = useIndividualClients({ page: pfPage, limit: 10, name: pfName, category: pfCategory || undefined });
  const pjQuery = useBusinessClients({ page: pjPage, limit: 10, name: pjName, category: pjCategory || undefined });

  const deletePF = useDeleteIndividualClient();
  const deletePJ = useDeleteBusinessClient();

  function handleExport(type: "pdf" | "csv", client: "pf" | "pj") {
    if (client === "pf" && type === "pdf") api.exports.individualPdf();
    else if (client === "pf" && type === "csv") api.exports.individualCsv();
    else if (client === "pj" && type === "pdf") api.exports.businessPdf();
    else api.exports.businessCsv();
    toast({ title: "Exportação iniciada", description: "O download começará em instantes." });
  }

  async function handleDeletePF(id: number) {
    try {
      await deletePF.mutateAsync(id);
      toast({ title: "Cliente excluído com sucesso." });
    } catch (e: unknown) {
      toast({ title: "Erro ao excluir", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  async function handleDeletePJ(id: number) {
    try {
      await deletePJ.mutateAsync(id);
      toast({ title: "Cliente excluído com sucesso." });
    } catch (e: unknown) {
      toast({ title: "Erro ao excluir", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">{t.clients.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.clients.subtitle}</p>
        </div>
        <Link href="/clientes/novo">
          <Button data-testid="button-new-client">
            <PlusCircle size={16} className="mr-2" />
            {t.clients.newClient}
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pf" | "pj")}>
        <TabsList className="mb-4">
          <TabsTrigger value="pf" data-testid="tab-pf">{t.clients.individual}</TabsTrigger>
          <TabsTrigger value="pj" data-testid="tab-pj">{t.clients.business}</TabsTrigger>
        </TabsList>

        {/* PF Tab */}
        <TabsContent value="pf">
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="relative flex-1 min-w-48">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder={t.clients.searchName}
                    value={pfName}
                    onChange={(e) => { setPfName(e.target.value); setPfPage(1); }}
                    data-testid="input-pf-search"
                  />
                </div>
                <Select value={pfCategory || "all"} onValueChange={(v) => { setPfCategory(v === "all" ? "" : v); setPfPage(1); }}>
                  <SelectTrigger className="w-44" data-testid="select-pf-category">
                    <Filter size={14} className="mr-1 text-muted-foreground" />
                    <SelectValue placeholder={t.clients.filterCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.clients.allCategories}</SelectItem>
                    {PF_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{t.form[c as keyof typeof t.form] as string ?? c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(pfName || pfCategory) && (
                  <Button variant="ghost" size="sm" onClick={() => { setPfName(""); setPfCategory(""); setPfPage(1); }} data-testid="button-pf-clear">
                    <X size={14} className="mr-1" /> {t.clients.clearFilters}
                  </Button>
                )}
                <div className="flex gap-1 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf", "pf")} data-testid="button-pf-export-pdf">
                    <FileDown size={14} className="mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv", "pf")} data-testid="button-pf-export-csv">
                    <FileDown size={14} className="mr-1" /> CSV
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.clients.name}</TableHead>
                      <TableHead>{t.clients.email}</TableHead>
                      <TableHead>{t.clients.category}</TableHead>
                      <TableHead>{t.clients.balance}</TableHead>
                      <TableHead className="text-right">{t.clients.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pfQuery.isLoading && <SkeletonRows cols={5} />}
                    {pfQuery.isError && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <ErrorState message={pfQuery.error?.message} onRetry={() => pfQuery.refetch()} />
                        </TableCell>
                      </TableRow>
                    )}
                    {pfQuery.data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <EmptyState message={t.clients.noResults} />
                        </TableCell>
                      </TableRow>
                    )}
                    {pfQuery.data?.data.map((c) => (
                      <TableRow key={c.id} data-testid={`row-pf-client-${c.id}`}>
                        <TableCell className="font-medium" data-testid={`text-pf-name-${c.id}`}>{c.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{c.email}</TableCell>
                        <TableCell><CategoryBadge category={c.category} type="individual" /></TableCell>
                        <TableCell className="font-semibold" data-testid={`text-pf-balance-${c.id}`}>
                          {formatCurrency(c.balance, settings ?? undefined)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/clientes/pf/${c.id}`}>
                              <Button variant="ghost" size="icon" title="Detalhes" data-testid={`button-pf-detail-${c.id}`}>
                                <Eye size={15} />
                              </Button>
                            </Link>
                            <Link href={`/clientes/pf/${c.id}/editar`}>
                              <Button variant="ghost" size="icon" title="Editar" data-testid={`button-pf-edit-${c.id}`}>
                                <Edit size={15} />
                              </Button>
                            </Link>
                            <Link href={`/clientes/pf/${c.id}/saque`}>
                              <Button variant="ghost" size="icon" title="Saque" data-testid={`button-pf-withdraw-${c.id}`}>
                                <ArrowDownToLine size={15} />
                              </Button>
                            </Link>
                            <Link href={`/clientes/pf/${c.id}/extrato`}>
                              <Button variant="ghost" size="icon" title="Extrato" data-testid={`button-pf-statement-${c.id}`}>
                                <FileText size={15} />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Excluir" className="text-destructive hover:text-destructive" data-testid={`button-pf-delete-${c.id}`}>
                                  <Trash2 size={15} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t.clients.deleteConfirm}</AlertDialogTitle>
                                  <AlertDialogDescription>{t.clients.deleteMessage}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t.clients.cancel}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePF(c.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid={`button-pf-delete-confirm-${c.id}`}
                                  >
                                    {t.clients.confirm}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pfQuery.data && (
                <Pagination
                  page={pfPage}
                  totalPages={pfQuery.data.totalPages}
                  onPageChange={setPfPage}
                  label={t.clients.page}
                  ofLabel={t.clients.of}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PJ Tab */}
        <TabsContent value="pj">
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="relative flex-1 min-w-48">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder={t.clients.searchName}
                    value={pjName}
                    onChange={(e) => { setPjName(e.target.value); setPjPage(1); }}
                    data-testid="input-pj-search"
                  />
                </div>
                <Select value={pjCategory || "all"} onValueChange={(v) => { setPjCategory(v === "all" ? "" : v); setPjPage(1); }}>
                  <SelectTrigger className="w-44" data-testid="select-pj-category">
                    <Filter size={14} className="mr-1 text-muted-foreground" />
                    <SelectValue placeholder={t.clients.filterCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.clients.allCategories}</SelectItem>
                    {PJ_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{t.form[c as keyof typeof t.form] as string ?? c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(pjName || pjCategory) && (
                  <Button variant="ghost" size="sm" onClick={() => { setPjName(""); setPjCategory(""); setPjPage(1); }} data-testid="button-pj-clear">
                    <X size={14} className="mr-1" /> {t.clients.clearFilters}
                  </Button>
                )}
                <div className="flex gap-1 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf", "pj")} data-testid="button-pj-export-pdf">
                    <FileDown size={14} className="mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv", "pj")} data-testid="button-pj-export-csv">
                    <FileDown size={14} className="mr-1" /> CSV
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.clients.companyName}</TableHead>
                      <TableHead>{t.clients.tradeName}</TableHead>
                      <TableHead>{t.clients.cnpj}</TableHead>
                      <TableHead>{t.clients.category}</TableHead>
                      <TableHead>{t.clients.balance}</TableHead>
                      <TableHead className="text-right">{t.clients.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pjQuery.isLoading && <SkeletonRows cols={6} />}
                    {pjQuery.isError && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <ErrorState message={pjQuery.error?.message} onRetry={() => pjQuery.refetch()} />
                        </TableCell>
                      </TableRow>
                    )}
                    {pjQuery.data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyState message={t.clients.noResults} />
                        </TableCell>
                      </TableRow>
                    )}
                    {pjQuery.data?.data.map((c) => (
                      <TableRow key={c.id} data-testid={`row-pj-client-${c.id}`}>
                        <TableCell className="font-medium" data-testid={`text-pj-name-${c.id}`}>{c.companyName}</TableCell>
                        <TableCell>{c.tradeName}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{formatCNPJ(c.cnpj)}</TableCell>
                        <TableCell><CategoryBadge category={c.category} type="business" /></TableCell>
                        <TableCell className="font-semibold" data-testid={`text-pj-balance-${c.id}`}>
                          {formatCurrency(c.balance, settings ?? undefined)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/clientes/pj/${c.id}`}>
                              <Button variant="ghost" size="icon" title="Detalhes" data-testid={`button-pj-detail-${c.id}`}>
                                <Eye size={15} />
                              </Button>
                            </Link>
                            <Link href={`/clientes/pj/${c.id}/editar`}>
                              <Button variant="ghost" size="icon" title="Editar" data-testid={`button-pj-edit-${c.id}`}>
                                <Edit size={15} />
                              </Button>
                            </Link>
                            <Link href={`/clientes/pj/${c.id}/saque`}>
                              <Button variant="ghost" size="icon" title="Saque" data-testid={`button-pj-withdraw-${c.id}`}>
                                <ArrowDownToLine size={15} />
                              </Button>
                            </Link>
                            <Link href={`/clientes/pj/${c.id}/extrato`}>
                              <Button variant="ghost" size="icon" title="Extrato" data-testid={`button-pj-statement-${c.id}`}>
                                <FileText size={15} />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Excluir" className="text-destructive hover:text-destructive" data-testid={`button-pj-delete-${c.id}`}>
                                  <Trash2 size={15} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t.clients.deleteConfirm}</AlertDialogTitle>
                                  <AlertDialogDescription>{t.clients.deleteMessage}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t.clients.cancel}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePJ(c.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid={`button-pj-delete-confirm-${c.id}`}
                                  >
                                    {t.clients.confirm}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pjQuery.data && (
                <Pagination
                  page={pjPage}
                  totalPages={pjQuery.data.totalPages}
                  onPageChange={setPjPage}
                  label={t.clients.page}
                  ofLabel={t.clients.of}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
