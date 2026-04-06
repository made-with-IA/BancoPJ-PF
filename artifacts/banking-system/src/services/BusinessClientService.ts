import { getDatabase } from '../database/connection';
import { BusinessClientRepository } from '../repositories/BusinessClientRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import {
  BusinessClientRecord,
  CreateBusinessClientDTO,
  UpdateBusinessClientDTO,
  BusinessClientFilters,
} from '../models/BusinessClient';
import { PaginatedResult, PaginationOptions } from '../interfaces/IRepository';
import { IClient, WithdrawalResult, StatementFilters, StatementResult } from '../interfaces/IClient';
import {
  BUSINESS_CLIENT_MAX_WITHDRAWAL,
  CLIENT_TYPES,
  TRANSACTION_TYPES,
} from '../config/constants';
import { AppError } from '../middlewares/errorHandler';

export class BusinessClientService implements IClient {
  private repo: BusinessClientRepository;
  private transactionRepo: TransactionRepository;
  private clientId: number;

  constructor(clientId: number = 0) {
    this.repo = new BusinessClientRepository();
    this.transactionRepo = new TransactionRepository();
    this.clientId = clientId;
  }

  async withdrawMoney(amount: number): Promise<WithdrawalResult> {
    if (amount <= 0) {
      throw new AppError(400, 'O valor deve ser maior que zero');
    }

    const client = this.repo.findById(this.clientId);
    if (!client) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    if (amount > BUSINESS_CLIENT_MAX_WITHDRAWAL) {
      throw new AppError(
        400,
        `Valor excede o limite máximo de saque para Pessoa Jurídica: R$ ${BUSINESS_CLIENT_MAX_WITHDRAWAL.toFixed(2)}`
      );
    }

    if (client.balance < amount) {
      throw new AppError(400, 'Saldo insuficiente para o saque');
    }

    const previousBalance = client.balance;
    const newBalance = previousBalance - amount;

    // Perform balance update and transaction creation atomically
    const db = getDatabase();
    const txFn = db.transaction(() => {
      this.repo.updateBalance(this.clientId, newBalance);
      return this.transactionRepo.create({
        clientId: this.clientId,
        clientType: CLIENT_TYPES.BUSINESS,
        transactionType: TRANSACTION_TYPES.WITHDRAWAL,
        amount,
        description: 'Saque',
        previousBalance,
        newBalance,
      });
    });

    const transaction = txFn();

    return {
      success: true,
      message: 'Saque realizado com sucesso!',
      previousBalance,
      newBalance,
      transactionId: transaction.id,
    };
  }

  async getStatement(filters: StatementFilters = {}): Promise<StatementResult> {
    const client = this.repo.findById(this.clientId);
    if (!client) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    const pagination: PaginationOptions = {
      page: filters.page || 1,
      limit: filters.limit || 10,
    };

    const result = this.transactionRepo.findAll(
      {
        clientId: this.clientId,
        clientType: CLIENT_TYPES.BUSINESS,
        transactionType: filters.transactionType,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      pagination
    );

    return {
      transactions: result.data,
      currentBalance: client.balance,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  listClients(
    filters: BusinessClientFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): PaginatedResult<BusinessClientRecord> {
    return this.repo.findAll(filters, pagination);
  }

  getClient(id: number): BusinessClientRecord | null {
    return this.repo.findById(id);
  }

  createClient(data: CreateBusinessClientDTO): BusinessClientRecord {
    return this.repo.create(data);
  }

  updateClient(id: number, data: UpdateBusinessClientDTO): BusinessClientRecord | null {
    return this.repo.update(id, data);
  }

  deleteClient(id: number): boolean {
    return this.repo.delete(id);
  }

  deposit(id: number, amount: number, description: string = 'Depósito'): WithdrawalResult {
    if (amount <= 0) {
      throw new AppError(400, 'O valor deve ser maior que zero');
    }

    const client = this.repo.findById(id);
    if (!client) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    const previousBalance = client.balance;
    const newBalance = previousBalance + amount;

    const db = getDatabase();
    const txFn = db.transaction(() => {
      this.repo.updateBalance(id, newBalance);
      return this.transactionRepo.create({
        clientId: id,
        clientType: CLIENT_TYPES.BUSINESS,
        transactionType: TRANSACTION_TYPES.DEPOSIT,
        amount,
        description,
        previousBalance,
        newBalance,
      });
    });

    const transaction = txFn();

    return {
      success: true,
      message: 'Depósito realizado com sucesso!',
      previousBalance,
      newBalance,
      transactionId: transaction.id,
    };
  }
}
