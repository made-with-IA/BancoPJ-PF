export interface SettingsRecord {
  id: number;
  language: string;
  currencyFormat: string;
  dateFormat: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDTO {
  language?: string;
  currencyFormat?: string;
  dateFormat?: string;
}
