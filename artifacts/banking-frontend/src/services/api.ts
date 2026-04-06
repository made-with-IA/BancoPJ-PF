import type {
  IndividualClient,
  BusinessClient,
  Settings,
  PaginatedResponse,
  StatementResponse,
  WithdrawResponse,
  IndividualClientFilters,
  BusinessClientFilters,
  StatementFilters,
} from "@/types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  individualClients: {
    list(filters: IndividualClientFilters = {}): Promise<PaginatedResponse<IndividualClient>> {
      return request(`/api/individual-clients${buildQuery(filters)}`);
    },
    get(id: number): Promise<IndividualClient> {
      return request(`/api/individual-clients/${id}`);
    },
    create(data: Omit<IndividualClient, "id" | "createdAt" | "updatedAt">): Promise<IndividualClient> {
      return request("/api/individual-clients", { method: "POST", body: JSON.stringify(data) });
    },
    update(id: number, data: Partial<Omit<IndividualClient, "id" | "createdAt" | "updatedAt">>): Promise<IndividualClient> {
      return request(`/api/individual-clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete(id: number): Promise<{ success: boolean; message: string }> {
      return request(`/api/individual-clients/${id}`, { method: "DELETE" });
    },
    withdraw(id: number, amount: number, description?: string): Promise<WithdrawResponse> {
      return request(`/api/individual-clients/${id}/withdraw`, {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
    },
    statement(id: number, filters: StatementFilters = {}): Promise<StatementResponse> {
      return request(`/api/individual-clients/${id}/statement${buildQuery(filters)}`);
    },
  },
  businessClients: {
    list(filters: BusinessClientFilters = {}): Promise<PaginatedResponse<BusinessClient>> {
      return request(`/api/business-clients${buildQuery(filters)}`);
    },
    get(id: number): Promise<BusinessClient> {
      return request(`/api/business-clients/${id}`);
    },
    create(data: Omit<BusinessClient, "id" | "createdAt" | "updatedAt">): Promise<BusinessClient> {
      return request("/api/business-clients", { method: "POST", body: JSON.stringify(data) });
    },
    update(id: number, data: Partial<Omit<BusinessClient, "id" | "createdAt" | "updatedAt">>): Promise<BusinessClient> {
      return request(`/api/business-clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete(id: number): Promise<{ success: boolean; message: string }> {
      return request(`/api/business-clients/${id}`, { method: "DELETE" });
    },
    withdraw(id: number, amount: number, description?: string): Promise<WithdrawResponse> {
      return request(`/api/business-clients/${id}/withdraw`, {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
    },
    statement(id: number, filters: StatementFilters = {}): Promise<StatementResponse> {
      return request(`/api/business-clients/${id}/statement${buildQuery(filters)}`);
    },
  },
  settings: {
    get(): Promise<Settings> {
      return request("/api/settings");
    },
    update(data: Partial<Pick<Settings, "language" | "currencyFormat" | "dateFormat">>): Promise<Settings> {
      return request("/api/settings", { method: "PUT", body: JSON.stringify(data) });
    },
  },
  exports: {
    download(path: string) {
      const a = document.createElement("a");
      a.href = path;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    individualPdf() { api.exports.download("/api/exports/individual-clients/pdf"); },
    individualCsv() { api.exports.download("/api/exports/individual-clients/csv"); },
    businessPdf() { api.exports.download("/api/exports/business-clients/pdf"); },
    businessCsv() { api.exports.download("/api/exports/business-clients/csv"); },
  },
};
