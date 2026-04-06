import { SettingsRepository } from '../repositories/SettingsRepository';
import { SettingsRecord, UpdateSettingsDTO } from '../models/Settings';
import { NotFoundError } from '../middlewares/errorHandler';

export class SettingsService {
  private repo: SettingsRepository;

  constructor() {
    this.repo = new SettingsRepository();
  }

  getSettings(): SettingsRecord {
    const settings = this.repo.getActiveSettings();
    if (!settings) {
      throw new NotFoundError('Configurações não encontradas');
    }
    return settings;
  }

  updateSettings(data: UpdateSettingsDTO): SettingsRecord {
    return this.repo.update(data);
  }
}
