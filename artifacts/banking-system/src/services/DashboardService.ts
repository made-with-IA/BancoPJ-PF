import { IndividualClientRepository } from '../repositories/IndividualClientRepository';
import { BusinessClientRepository } from '../repositories/BusinessClientRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { TransactionRecord } from '../models/Transaction';

export interface DashboardStats {
  totalClients: number;
  totalIndividual: number;
  totalBusiness: number;
  totalBalance: number;
  totalIndividualBalance: number;
  totalBusinessBalance: number;
  recentTransactions: TransactionRecord[];
}

export class DashboardService {
  private individualRepo = new IndividualClientRepository();
  private businessRepo = new BusinessClientRepository();
  private transactionRepo = new TransactionRepository();

  getStats(): DashboardStats {
    const individualResult = this.individualRepo.findAll({}, { page: 1, limit: 9999 });
    const businessResult = this.businessRepo.findAll({}, { page: 1, limit: 9999 });
    const recentTransactions = this.transactionRepo.getRecentTransactions(10);

    const totalIndividual = individualResult.total;
    const totalBusiness = businessResult.total;
    const totalIndividualBalance = individualResult.data.reduce((s, c) => s + c.balance, 0);
    const totalBusinessBalance = businessResult.data.reduce((s, c) => s + c.balance, 0);

    return {
      totalClients: totalIndividual + totalBusiness,
      totalIndividual,
      totalBusiness,
      totalBalance: totalIndividualBalance + totalBusinessBalance,
      totalIndividualBalance,
      totalBusinessBalance,
      recentTransactions,
    };
  }
}
