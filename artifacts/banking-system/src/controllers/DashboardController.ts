import { Request, Response, NextFunction } from 'express';
import { IndividualClientRepository } from '../repositories/IndividualClientRepository';
import { BusinessClientRepository } from '../repositories/BusinessClientRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { formatCurrency, formatDate } from '../utils/formatters';

export class DashboardController {
  private individualRepo = new IndividualClientRepository();
  private businessRepo = new BusinessClientRepository();
  private transactionRepo = new TransactionRepository();

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const individualResult = this.individualRepo.findAll({}, { page: 1, limit: 9999 });
      const businessResult = this.businessRepo.findAll({}, { page: 1, limit: 9999 });
      const recentTransactions = this.transactionRepo.getRecentTransactions(10);

      const totalIndividual = individualResult.total;
      const totalBusiness = businessResult.total;
      const totalClients = totalIndividual + totalBusiness;

      const totalIndividualBalance = individualResult.data.reduce((s, c) => s + c.balance, 0);
      const totalBusinessBalance = businessResult.data.reduce((s, c) => s + c.balance, 0);
      const totalBalance = totalIndividualBalance + totalBusinessBalance;

      const settings = res.locals.settings;
      const lang = res.locals.lang;
      const translations = res.locals.translations;

      const formattedTransactions = recentTransactions.map(tx => ({
        ...tx,
        formattedAmount: formatCurrency(tx.amount, settings),
        formattedDate: formatDate(tx.createdAt, settings),
        formattedNewBalance: formatCurrency(tx.newBalance, settings),
      }));

      res.render('dashboard/index', {
        title: 'Dashboard',
        totalClients,
        totalIndividual,
        totalBusiness,
        totalBalance: formatCurrency(totalBalance, settings),
        totalIndividualBalance: formatCurrency(totalIndividualBalance, settings),
        totalBusinessBalance: formatCurrency(totalBusinessBalance, settings),
        recentTransactions: formattedTransactions,
        translations,
        lang,
        settings,
        flash: req.query.flash || null,
        flashType: req.query.flashType || 'success',
      });
    } catch (err) {
      next(err);
    }
  };
}
