import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Settings } from "@/types";

export function useUpdateSettings(onSettingsUpdated: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pick<Settings, "language" | "currencyFormat" | "dateFormat">>) =>
      api.settings.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      onSettingsUpdated();
    },
  });
}
