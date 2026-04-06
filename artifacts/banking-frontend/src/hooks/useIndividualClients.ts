import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { IndividualClientFilters } from "@/types";

export const INDIVIDUAL_CLIENTS_KEY = "individual-clients";

export function useIndividualClients(filters: IndividualClientFilters = {}) {
  return useQuery({
    queryKey: [INDIVIDUAL_CLIENTS_KEY, filters],
    queryFn: () => api.individualClients.list(filters),
  });
}

export function useIndividualClient(id: number) {
  return useQuery({
    queryKey: [INDIVIDUAL_CLIENTS_KEY, id],
    queryFn: () => api.individualClients.get(id),
    enabled: !!id,
  });
}

export function useCreateIndividualClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.individualClients.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [INDIVIDUAL_CLIENTS_KEY] }),
  });
}

export function useUpdateIndividualClient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.individualClients.update>[1]) =>
      api.individualClients.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INDIVIDUAL_CLIENTS_KEY] }),
  });
}

export function useDeleteIndividualClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.individualClients.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INDIVIDUAL_CLIENTS_KEY] }),
  });
}

export function useWithdrawIndividualClient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) =>
      api.individualClients.withdraw(id, amount, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INDIVIDUAL_CLIENTS_KEY] }),
  });
}

export function useIndividualStatement(id: number, filters: IndividualClientFilters = {}) {
  return useQuery({
    queryKey: [INDIVIDUAL_CLIENTS_KEY, id, "statement", filters],
    queryFn: () => api.individualClients.statement(id, filters),
    enabled: !!id,
  });
}
