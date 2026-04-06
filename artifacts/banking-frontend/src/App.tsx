import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/context/SettingsContext";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ClientsList from "@/pages/ClientsList";
import ClientNew from "@/pages/ClientNew";
import IndividualClientDetail from "@/pages/IndividualClientDetail";
import BusinessClientDetail from "@/pages/BusinessClientDetail";
import IndividualClientEdit from "@/pages/IndividualClientEdit";
import BusinessClientEdit from "@/pages/BusinessClientEdit";
import Withdraw from "@/pages/Withdraw";
import Statement from "@/pages/Statement";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clientes" component={ClientsList} />
        <Route path="/clientes/novo" component={ClientNew} />
        <Route path="/clientes/pf/:id">
          {(params) => <IndividualClientDetail id={Number(params.id)} />}
        </Route>
        <Route path="/clientes/pj/:id">
          {(params) => <BusinessClientDetail id={Number(params.id)} />}
        </Route>
        <Route path="/clientes/pf/:id/editar">
          {(params) => <IndividualClientEdit id={Number(params.id)} />}
        </Route>
        <Route path="/clientes/pj/:id/editar">
          {(params) => <BusinessClientEdit id={Number(params.id)} />}
        </Route>
        <Route path="/clientes/pf/:id/saque">
          {(params) => <Withdraw id={Number(params.id)} type="pf" />}
        </Route>
        <Route path="/clientes/pj/:id/saque">
          {(params) => <Withdraw id={Number(params.id)} type="pj" />}
        </Route>
        <Route path="/clientes/pf/:id/extrato">
          {(params) => <Statement id={Number(params.id)} type="pf" />}
        </Route>
        <Route path="/clientes/pj/:id/extrato">
          {(params) => <Statement id={Number(params.id)} type="pj" />}
        </Route>
        <Route path="/configuracoes" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
