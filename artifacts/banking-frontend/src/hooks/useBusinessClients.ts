import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { BusinessClientFilters } from "@/types";

export const BUSINESS_CLIENTS_KEY = "business-clients";

export function useBusinessClients(filters: BusinessClientFilters = {}) {
  return useQuery({
    queryKey: [BUSINESS_CLIENTS_KEY, filters],
    queryFn: () => api.businessClients.list(filters),
  });
}

export function useBusinessClient(id: number) {
  return useQuery({
    queryKey: [BUSINESS_CLIENTS_KEY, id],
    queryFn: () => api.businessClients.get(id),
    enabled: !!id,
  });
}

export function useCreateBusinessClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.businessClients.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUSINESS_CLIENTS_KEY] }),
  });
}

export function useUpdateBusinessClient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.businessClients.update>[1]) =>
      api.businessClients.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUSINESS_CLIENTS_KEY] }),
  });
}

export function useDeleteBusinessClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.businessClients.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUSINESS_CLIENTS_KEY] }),
  });
}

export function useWithdrawBusinessClient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) =>
      api.businessClients.withdraw(id, amount, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUSINESS_CLIENTS_KEY] }),
  });
}

export function useBusinessStatement(id: number, filters: BusinessClientFilters = {}) {
  return useQuery({
    queryKey: [BUSINESS_CLIENTS_KEY, id, "statement", filters],
    queryFn: () => api.businessClients.statement(id, filters),
    enabled: !!id,
  });
}
