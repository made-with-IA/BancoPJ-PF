import { getDatabase } from '../database/connection';
import { TransactionRecord, CreateTransactionDTO } from '../models/Transaction';
import { PaginatedResult, PaginationOptions } from '../interfaces/IRepository';
import { DatabaseError } from '../middlewares/errorHandler';

interface TransactionFilters {
  clientId?: number;
  clientType?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}

export class TransactionRepository {
  private get db() {
    return getDatabase();
  }

  findAll(
    filters: TransactionFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): PaginatedResult<TransactionRecord> {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (filters.clientId !== undefined) {
        conditions.push('client_id = ?');
        params.push(filters.clientId);
      }
      if (filters.clientType) {
        conditions.push('client_type = ?');
        params.push(filters.clientType);
      }
      if (filters.transactionType) {
        conditions.push('transaction_type = ?');
        params.push(filters.transactionType);
      }
      if (filters.startDate) {
        conditions.push('created_at >= ?');
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        conditions.push('created_at <= ?');
        params.push(filters.endDate + ' 23:59:59');
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = this.db
        .prepare(`SELECT COUNT(*) as total FROM transactions ${where}`)
        .get(...params) as { total: number };

      const total = countResult.total;
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      const rows = this.db
        .prepare(`SELECT * FROM transactions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .all(...params, pagination.limit, offset) as Record<string, unknown>[];

      return {
        data: rows.map(this.mapRow),
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      };
    } catch (err) {
      throw new DatabaseError(`Error fetching transactions: ${(err as Error).message}`);
    }
  }

  create(data: CreateTransactionDTO): TransactionRecord {
    try {
      const result = this.db
        .prepare(`
          INSERT INTO transactions (client_id, client_type, transaction_type, amount, description, previous_balance, new_balance)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          data.clientId,
          data.clientType,
          data.transactionType,
          data.amount,
          data.description,
          data.previousBalance,
          data.newBalance
        );

      const row = this.db
        .prepare('SELECT * FROM transactions WHERE id = ?')
        .get(result.lastInsertRowid) as Record<string, unknown>;

      return this.mapRow(row);
    } catch (err) {
      throw new DatabaseError(`Error creating transaction: ${(err as Error).message}`);
    }
  }

  getRecentTransactions(limit: number = 10): TransactionRecord[] {
    try {
      const rows = this.db
        .prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?')
        .all(limit) as Record<string, unknown>[];
      return rows.map(this.mapRow);
    } catch (err) {
      throw new DatabaseError(`Error fetching recent transactions: ${(err as Error).message}`);
    }
  }

  private mapRow(row: Record<string, unknown>): TransactionRecord {
    return {
      id: row['id'] as number,
      clientId: row['client_id'] as number,
      clientType: row['client_type'] as string,
      transactionType: row['transaction_type'] as string,
      amount: row['amount'] as number,
      description: row['description'] as string,
      previousBalance: row['previous_balance'] as number,
      newBalance: row['new_balance'] as number,
      createdAt: row['created_at'] as string,
    };
  }
}
