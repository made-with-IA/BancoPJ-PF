import { Request, Response, NextFunction } from 'express';
import { BusinessClientService } from '../services/BusinessClientService';
import { ExportService } from '../services/ExportService';
import {
  createBusinessClientSchema,
  updateBusinessClientSchema,
  withdrawalSchema,
  formatZodErrors,
} from '../utils/validation';
import { NotFoundError, AppError } from '../middlewares/errorHandler';
import { formatCurrency, formatDate } from '../utils/formatters';
import { DEFAULT_PAGE_SIZE, BUSINESS_CLIENT_MAX_WITHDRAWAL } from '../config/constants';

const exportService = new ExportService();

export class BusinessClientController {
  private getService(clientId: number = 0): BusinessClientService {
    return new BusinessClientService(clientId);
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
        cnpj: req.query.cnpj as string || undefined,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined,
      };

      const service = this.getService();
      const result = service.listClients(filters, { page, limit });
      const settings = res.locals.settings;

      const formattedClients = result.data.map(c => ({
        ...c,
        formattedBalance: formatCurrency(c.balance, settings),
        formattedCreatedAt: formatDate(c.createdAt, settings),
      }));

      res.render('clients/list-business', {
        title: res.locals.t('businessClient'),
        clients: formattedClients,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        filters,
        translations: res.locals.translations,
        lang: res.locals.lang,
        settings,
        flash: req.query.flash || null,
        flashType: req.query.flashType || 'success',
      });
    } catch (err) {
      next(err);
    }
  };

  newForm = (req: Request, res: Response): void => {
    res.render('clients/form-business', {
      title: res.locals.t('newClient'),
      client: null,
      errors: [],
      translations: res.locals.translations,
      lang: res.locals.lang,
      settings: res.locals.settings,
    });
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createBusinessClientSchema.safeParse(req.body);
      if (!parsed.success) {
        res.render('clients/form-business', {
          title: res.locals.t('newClient'),
          client: req.body,
          errors: formatZodErrors(parsed.error),
          translations: res.locals.translations,
          lang: res.locals.lang,
          settings: res.locals.settings,
        });
        return;
      }
      const service = this.getService();
      service.createClient(parsed.data);
      res.redirect(`/clientes/business?flash=${encodeURIComponent(res.locals.t('clientCreated'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const client = service.getClient(id);
      if (!client) throw new NotFoundError('Cliente não encontrado');

      const settings = res.locals.settings;

      res.render('clients/detail-business', {
        title: client.companyName,
        client: {
          ...client,
          formattedBalance: formatCurrency(client.balance, settings),
          formattedCreatedAt: formatDate(client.createdAt, settings),
          formattedUpdatedAt: formatDate(client.updatedAt, settings),
        },
        maxWithdrawal: BUSINESS_CLIENT_MAX_WITHDRAWAL,
        formattedMaxWithdrawal: formatCurrency(BUSINESS_CLIENT_MAX_WITHDRAWAL, settings),
        translations: res.locals.translations,
        lang: res.locals.lang,
        settings,
        flash: req.query.flash || null,
        flashType: req.query.flashType || 'success',
      });
    } catch (err) {
      next(err);
    }
  };

  editForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const client = service.getClient(id);
      if (!client) throw new NotFoundError('Cliente não encontrado');

      res.render('clients/form-business', {
        title: `${res.locals.t('edit')} - ${client.companyName}`,
        client,
        errors: [],
        translations: res.locals.translations,
        lang: res.locals.lang,
        settings: res.locals.settings,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = updateBusinessClientSchema.safeParse(req.body);
      if (!parsed.success) {
        const service = this.getService(id);
        const client = service.getClient(id);
        res.render('clients/form-business', {
          title: res.locals.t('edit'),
          client: { ...client, ...req.body, id },
          errors: formatZodErrors(parsed.error),
          translations: res.locals.translations,
          lang: res.locals.lang,
          settings: res.locals.settings,
        });
        return;
      }
      const service = this.getService(id);
      service.updateClient(id, parsed.data);
      res.redirect(`/clientes/business/${id}?flash=${encodeURIComponent(res.locals.t('clientUpdated'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const deleted = service.deleteClient(id);
      if (!deleted) throw new NotFoundError('Cliente não encontrado');
      res.redirect(`/clientes/business?flash=${encodeURIComponent(res.locals.t('clientDeleted'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  statement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const client = service.getClient(id);
      if (!client) throw new NotFoundError('Cliente não encontrado');

      const page = parseInt(req.query.page as string) || 1;
      const filters = {
        transactionType: req.query.transactionType as string || undefined,
        startDate: req.query.startDate as string || undefined,
        endDate: req.query.endDate as string || undefined,
        page,
        limit: DEFAULT_PAGE_SIZE,
      };

      const statementService = new BusinessClientService(id);
      const statement = await statementService.getStatement(filters);
      const settings = res.locals.settings;

      const formattedTransactions = statement.transactions.map(tx => ({
        ...tx,
        formattedAmount: formatCurrency(tx.amount, settings),
        formattedDate: formatDate(tx.createdAt, settings),
        formattedNewBalance: formatCurrency(tx.newBalance, settings),
        formattedPrevBalance: formatCurrency(tx.previousBalance, settings),
      }));

      res.render('clients/statement', {
        title: `${res.locals.t('statement')} - ${client.companyName}`,
        client: { ...client, formattedBalance: formatCurrency(client.balance, settings), name: client.companyName },
        clientType: 'business',
        transactions: formattedTransactions,
        currentBalance: formatCurrency(statement.currentBalance, settings),
        pagination: {
          total: statement.total,
          page: statement.page,
          limit: statement.limit,
          totalPages: statement.totalPages,
        },
        filters,
        translations: res.locals.translations,
        lang: res.locals.lang,
        settings,
      });
    } catch (err) {
      next(err);
    }
  };

  webWithdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = withdrawalSchema.safeParse(req.body);
      if (!parsed.success) {
        const errs = formatZodErrors(parsed.error);
        res.redirect(`/clientes/business/${id}?flash=${encodeURIComponent(errs[0]?.message || 'Erro')}&flashType=error`);
        return;
      }
      const service = new BusinessClientService(id);
      await service.withdrawMoney(parsed.data.amount);
      res.redirect(`/clientes/business/${id}?flash=${encodeURIComponent(res.locals.t('withdrawalSuccess'))}&flashType=success`);
    } catch (err) {
      if (err instanceof AppError) {
        const id = parseInt(req.params.id);
        res.redirect(`/clientes/business/${id}?flash=${encodeURIComponent(err.message)}&flashType=error`);
        return;
      }
      next(err);
    }
  };

  apiList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
        cnpj: req.query.cnpj as string || undefined,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined,
      };
      const service = this.getService();
      const result = service.listClients(filters, { page, limit });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  apiCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createBusinessClientSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', errors: formatZodErrors(parsed.error) });
        return;
      }
      const service = this.getService();
      const client = service.createClient(parsed.data);
      res.status(201).json(client);
    } catch (err) {
      next(err);
    }
  };

  apiGet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const client = service.getClient(id);
      if (!client) throw new NotFoundError('Cliente não encontrado');
      res.json(client);
    } catch (err) {
      next(err);
    }
  };

  apiUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = updateBusinessClientSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', errors: formatZodErrors(parsed.error) });
        return;
      }
      const service = this.getService(id);
      const updated = service.updateClient(id, parsed.data);
      if (!updated) throw new NotFoundError('Cliente não encontrado');
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  apiDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const deleted = service.deleteClient(id);
      if (!deleted) throw new NotFoundError('Cliente não encontrado');
      res.json({ success: true, message: 'Cliente excluído com sucesso' });
    } catch (err) {
      next(err);
    }
  };

  apiWithdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = withdrawalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', errors: formatZodErrors(parsed.error) });
        return;
      }
      const service = new BusinessClientService(id);
      const result = await service.withdrawMoney(parsed.data.amount);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  apiStatement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const filters = {
        transactionType: req.query.transactionType as string || undefined,
        startDate: req.query.startDate as string || undefined,
        endDate: req.query.endDate as string || undefined,
        page,
        limit: parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE,
      };
      const service = new BusinessClientService(id);
      const statement = await service.getStatement(filters);
      res.json(statement);
    } catch (err) {
      next(err);
    }
  };

  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
        cnpj: req.query.cnpj as string || undefined,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined,
      };
      const service = this.getService();
      const result = service.listClients(filters, { page: 1, limit: 9999 });
      exportService.exportBusinessClientsPdf(result.data, res.locals.settings, res);
    } catch (err) {
      next(err);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
        cnpj: req.query.cnpj as string || undefined,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined,
      };
      const service = this.getService();
      const result = service.listClients(filters, { page: 1, limit: 9999 });
      await exportService.exportBusinessClientsCsv(result.data, res.locals.settings, res);
    } catch (err) {
      next(err);
    }
  };
}
