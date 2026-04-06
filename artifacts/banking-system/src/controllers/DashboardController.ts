import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { formatCurrency, formatDate } from '../utils/formatters';

export class DashboardController {
  private service = new DashboardService();

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.service.getStats();
      const settings = res.locals.settings;
      const lang = res.locals.lang;
      const translations = res.locals.translations;

      const formattedTransactions = stats.recentTransactions.map(tx => ({
        ...tx,
        formattedAmount: formatCurrency(tx.amount, settings),
        formattedDate: formatDate(tx.createdAt, settings),
        formattedNewBalance: formatCurrency(tx.newBalance, settings),
      }));

      res.render('dashboard/index', {
        title: translations['dashboard'] || 'Dashboard',
        totalClients: stats.totalClients,
        totalIndividual: stats.totalIndividual,
        totalBusiness: stats.totalBusiness,
        totalBalance: formatCurrency(stats.totalBalance, settings),
        totalIndividualBalance: formatCurrency(stats.totalIndividualBalance, settings),
        totalBusinessBalance: formatCurrency(stats.totalBusinessBalance, settings),
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
