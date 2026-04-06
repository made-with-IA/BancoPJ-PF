import { getDatabase } from '../database/connection';
import {
  IndividualClientRecord,
  CreateIndividualClientDTO,
  UpdateIndividualClientDTO,
  IndividualClientFilters,
} from '../models/IndividualClient';
import { PaginatedResult, PaginationOptions } from '../interfaces/IRepository';
import { DatabaseError } from '../middlewares/errorHandler';

export class IndividualClientRepository {
  private get db() {
    return getDatabase();
  }

  findAll(
    filters: IndividualClientFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): PaginatedResult<IndividualClientRecord> {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (filters.name) {
        conditions.push('full_name LIKE ?');
        params.push(`%${filters.name}%`);
      }
      if (filters.email) {
        conditions.push('email LIKE ?');
        params.push(`%${filters.email}%`);
      }
      if (filters.category) {
        conditions.push('category = ?');
        params.push(filters.category);
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
        .prepare(`SELECT COUNT(*) as total FROM individual_clients ${where}`)
        .get(...params) as { total: number };

      const total = countResult.total;
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      const rows = this.db
        .prepare(`SELECT * FROM individual_clients ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .all(...params, pagination.limit, offset) as Record<string, unknown>[];

      return {
        data: rows.map(this.mapRow),
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      };
    } catch (err) {
      throw new DatabaseError(`Error fetching individual clients: ${(err as Error).message}`);
    }
  }

  findById(id: number): IndividualClientRecord | null {
    try {
      const row = this.db
        .prepare('SELECT * FROM individual_clients WHERE id = ?')
        .get(id) as Record<string, unknown> | undefined;
      return row ? this.mapRow(row) : null;
    } catch (err) {
      throw new DatabaseError(`Error fetching individual client: ${(err as Error).message}`);
    }
  }

  create(data: CreateIndividualClientDTO): IndividualClientRecord {
    try {
      const result = this.db
        .prepare(`
          INSERT INTO individual_clients (full_name, monthly_income, age, phone, email, category, balance)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          data.fullName,
          data.monthlyIncome,
          data.age,
          data.phone || '',
          data.email || '',
          data.category || 'standard',
          data.balance || 0
        );

      return this.findById(result.lastInsertRowid as number)!;
    } catch (err) {
      throw new DatabaseError(`Error creating individual client: ${(err as Error).message}`);
    }
  }

  update(id: number, data: UpdateIndividualClientDTO): IndividualClientRecord | null {
    try {
      const existing = this.findById(id);
      if (!existing) return null;

      const fields: string[] = [];
      const params: unknown[] = [];

      if (data.fullName !== undefined) { fields.push('full_name = ?'); params.push(data.fullName); }
      if (data.monthlyIncome !== undefined) { fields.push('monthly_income = ?'); params.push(data.monthlyIncome); }
      if (data.age !== undefined) { fields.push('age = ?'); params.push(data.age); }
      if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone); }
      if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email); }
      if (data.category !== undefined) { fields.push('category = ?'); params.push(data.category); }
      if (data.balance !== undefined) { fields.push('balance = ?'); params.push(data.balance); }

      if (fields.length === 0) return existing;

      fields.push("updated_at = datetime('now')");
      params.push(id);

      this.db
        .prepare(`UPDATE individual_clients SET ${fields.join(', ')} WHERE id = ?`)
        .run(...params);

      return this.findById(id);
    } catch (err) {
      throw new DatabaseError(`Error updating individual client: ${(err as Error).message}`);
    }
  }

  updateBalance(id: number, newBalance: number): void {
    try {
      this.db
        .prepare("UPDATE individual_clients SET balance = ?, updated_at = datetime('now') WHERE id = ?")
        .run(newBalance, id);
    } catch (err) {
      throw new DatabaseError(`Error updating balance: ${(err as Error).message}`);
    }
  }

  delete(id: number): boolean {
    try {
      const result = this.db
        .prepare('DELETE FROM individual_clients WHERE id = ?')
        .run(id);
      return result.changes > 0;
    } catch (err) {
      throw new DatabaseError(`Error deleting individual client: ${(err as Error).message}`);
    }
  }

  private mapRow(row: Record<string, unknown>): IndividualClientRecord {
    return {
      id: row['id'] as number,
      fullName: row['full_name'] as string,
      monthlyIncome: row['monthly_income'] as number,
      age: row['age'] as number,
      phone: row['phone'] as string,
      email: row['email'] as string,
      category: row['category'] as string,
      balance: row['balance'] as number,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }
}
