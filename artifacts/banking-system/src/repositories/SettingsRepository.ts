import { getDatabase } from '../database/connection';
import { SettingsRecord, UpdateSettingsDTO } from '../models/Settings';
import { DatabaseError } from '../middlewares/errorHandler';

export class SettingsRepository {
  private get db() {
    return getDatabase();
  }

  getActiveSettings(): SettingsRecord | null {
    try {
      const row = this.db
        .prepare('SELECT * FROM settings WHERE active = 1 ORDER BY id DESC LIMIT 1')
        .get() as Record<string, unknown> | undefined;
      return row ? this.mapRow(row) : null;
    } catch (err) {
      throw new DatabaseError(`Error fetching settings: ${(err as Error).message}`);
    }
  }

  update(data: UpdateSettingsDTO): SettingsRecord {
    try {
      const fields: string[] = [];
      const params: unknown[] = [];

      if (data.language !== undefined) { fields.push('language = ?'); params.push(data.language); }
      if (data.currencyFormat !== undefined) { fields.push('currency_format = ?'); params.push(data.currencyFormat); }
      if (data.dateFormat !== undefined) { fields.push('date_format = ?'); params.push(data.dateFormat); }

      if (fields.length > 0) {
        fields.push("updated_at = datetime('now')");
        this.db
          .prepare(`UPDATE settings SET ${fields.join(', ')} WHERE active = 1`)
          .run(...params);
      }

      return this.getActiveSettings()!;
    } catch (err) {
      throw new DatabaseError(`Error updating settings: ${(err as Error).message}`);
    }
  }

  private mapRow(row: Record<string, unknown>): SettingsRecord {
    return {
      id: row['id'] as number,
      language: row['language'] as string,
      currencyFormat: row['currency_format'] as string,
      dateFormat: row['date_format'] as string,
      active: Boolean(row['active']),
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }
}
