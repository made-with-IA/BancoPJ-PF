import { getDatabase } from '../database/connection';
import {
  BusinessClientRecord,
  CreateBusinessClientDTO,
  UpdateBusinessClientDTO,
  BusinessClientFilters,
} from '../models/BusinessClient';
import { PaginatedResult, PaginationOptions } from '../interfaces/IRepository';
import { DatabaseError } from '../middlewares/errorHandler';

export class BusinessClientRepository {
  private get db() {
    return getDatabase();
  }

  findAll(
    filters: BusinessClientFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): PaginatedResult<BusinessClientRecord> {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (filters.name) {
        conditions.push('(company_name LIKE ? OR trade_name LIKE ?)');
        params.push(`%${filters.name}%`, `%${filters.name}%`);
      }
      if (filters.email) {
        conditions.push('email LIKE ?');
        params.push(`%${filters.email}%`);
      }
      if (filters.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }
      if (filters.cnpj) {
        conditions.push('cnpj LIKE ?');
        params.push(`%${filters.cnpj}%`);
      }
      if (filters.minBalance !== undefined) {
        conditions.push('balance >= ?');
        params.push(filters.minBalance);
      }
      if (filters.maxBalance !== undefined) {
        conditions.push('balance <= ?');
        params.push(filters.maxBalance);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = this.db
        .prepare(`SELECT COUNT(*) as total FROM business_clients ${where}`)
        .get(...params) as { total: number };

      const total = countResult.total;
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      const rows = this.db
        .prepare(`SELECT * FROM business_clients ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .all(...params, pagination.limit, offset) as Record<string, unknown>[];

      return {
        data: rows.map(this.mapRow),
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      };
    } catch (err) {
      throw new DatabaseError(`Error fetching business clients: ${(err as Error).message}`);
    }
  }

  findById(id: number): BusinessClientRecord | null {
    try {
      const row = this.db
        .prepare('SELECT * FROM business_clients WHERE id = ?')
        .get(id) as Record<string, unknown> | undefined;
      return row ? this.mapRow(row) : null;
    } catch (err) {
      throw new DatabaseError(`Error fetching business client: ${(err as Error).message}`);
    }
  }

  create(data: CreateBusinessClientDTO): BusinessClientRecord {
    try {
      const result = this.db
        .prepare(`
          INSERT INTO business_clients (company_name, trade_name, cnpj, phone, email, category, balance)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          data.companyName,
          data.tradeName,
          data.cnpj,
          data.phone || '',
          data.email || '',
          data.category || 'standard',
          data.balance || 0
        );

      return this.findById(result.lastInsertRowid as number)!;
    } catch (err) {
      throw new DatabaseError(`Error creating business client: ${(err as Error).message}`);
    }
  }

  update(id: number, data: UpdateBusinessClientDTO): BusinessClientRecord | null {
    try {
      const existing = this.findById(id);
      if (!existing) return null;

      const fields: string[] = [];
      const params: unknown[] = [];

      if (data.companyName !== undefined) { fields.push('company_name = ?'); params.push(data.companyName); }
      if (data.tradeName !== undefined) { fields.push('trade_name = ?'); params.push(data.tradeName); }
      if (data.cnpj !== undefined) { fields.push('cnpj = ?'); params.push(data.cnpj); }
      if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone); }
      if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email); }
      if (data.category !== undefined) { fields.push('category = ?'); params.push(data.category); }
      if (data.balance !== undefined) { fields.push('balance = ?'); params.push(data.balance); }

      if (fields.length === 0) return existing;

      fields.push("updated_at = datetime('now')");
      params.push(id);

      this.db
        .prepare(`UPDATE business_clients SET ${fields.join(', ')} WHERE id = ?`)
        .run(...params);

      return this.findById(id);
    } catch (err) {
      throw new DatabaseError(`Error updating business client: ${(err as Error).message}`);
    }
  }

  updateBalance(id: number, newBalance: number): void {
    try {
      this.db
        .prepare("UPDATE business_clients SET balance = ?, updated_at = datetime('now') WHERE id = ?")
        .run(newBalance, id);
    } catch (err) {
      throw new DatabaseError(`Error updating balance: ${(err as Error).message}`);
    }
  }

  delete(id: number): boolean {
    try {
      const result = this.db
        .prepare('DELETE FROM business_clients WHERE id = ?')
        .run(id);
      return result.changes > 0;
    } catch (err) {
      throw new DatabaseError(`Error deleting business client: ${(err as Error).message}`);
    }
  }

  private mapRow(row: Record<string, unknown>): BusinessClientRecord {
    return {
      id: row['id'] as number,
      companyName: row['company_name'] as string,
      tradeName: row['trade_name'] as string,
      cnpj: row['cnpj'] as string,
      phone: row['phone'] as string,
      email: row['email'] as string,
      category: row['category'] as string,
      balance: row['balance'] as number,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }
}
