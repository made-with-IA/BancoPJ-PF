import { Request, Response, NextFunction } from 'express';
import { IndividualClientService } from '../services/IndividualClientService';
import { ExportService } from '../services/ExportService';
import {
  createIndividualClientSchema,
  updateIndividualClientSchema,
  withdrawalSchema,
  formatZodErrors,
} from '../utils/validation';
import { NotFoundError, AppError, ValidationError } from '../middlewares/errorHandler';
import { formatCurrency, formatDate } from '../utils/formatters';
import { DEFAULT_PAGE_SIZE, INDIVIDUAL_CLIENT_MAX_WITHDRAWAL } from '../config/constants';
import { ZodError } from 'zod';

const exportService = new ExportService();

export class IndividualClientController {
  private getService(clientId: number = 0): IndividualClientService {
    return new IndividualClientService(clientId);
  }

  // GET /clientes?type=individual
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
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

      res.render('clients/list-individual', {
        title: res.locals.t('individualClient'),
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

  // GET /clientes/individual/novo
  newForm = (req: Request, res: Response): void => {
    res.render('clients/form-individual', {
      title: res.locals.t('newClient'),
      client: null,
      errors: [],
      translations: res.locals.translations,
      lang: res.locals.lang,
      settings: res.locals.settings,
    });
  };

  // POST /clientes/individual
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createIndividualClientSchema.safeParse(req.body);
      if (!parsed.success) {
        res.render('clients/form-individual', {
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
      res.redirect(`/clientes/individual?flash=${encodeURIComponent(res.locals.t('clientCreated'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  // GET /clientes/individual/:id
  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const client = service.getClient(id);
      if (!client) throw new NotFoundError('Cliente não encontrado');

      const settings = res.locals.settings;

      res.render('clients/detail-individual', {
        title: client.fullName,
        client: {
          ...client,
          formattedBalance: formatCurrency(client.balance, settings),
          formattedMonthlyIncome: formatCurrency(client.monthlyIncome, settings),
          formattedCreatedAt: formatDate(client.createdAt, settings),
          formattedUpdatedAt: formatDate(client.updatedAt, settings),
        },
        maxWithdrawal: INDIVIDUAL_CLIENT_MAX_WITHDRAWAL,
        formattedMaxWithdrawal: formatCurrency(INDIVIDUAL_CLIENT_MAX_WITHDRAWAL, settings),
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

  // GET /clientes/individual/:id/editar
  editForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const client = service.getClient(id);
      if (!client) throw new NotFoundError('Cliente não encontrado');

      res.render('clients/form-individual', {
        title: `${res.locals.t('edit')} - ${client.fullName}`,
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

  // POST /clientes/individual/:id/editar
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = updateIndividualClientSchema.safeParse(req.body);
      if (!parsed.success) {
        const service = this.getService(id);
        const client = service.getClient(id);
        res.render('clients/form-individual', {
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
      res.redirect(`/clientes/individual/${id}?flash=${encodeURIComponent(res.locals.t('clientUpdated'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  // POST /clientes/individual/:id/excluir
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const service = this.getService(id);
      const deleted = service.deleteClient(id);
      if (!deleted) throw new NotFoundError('Cliente não encontrado');
      res.redirect(`/clientes/individual?flash=${encodeURIComponent(res.locals.t('clientDeleted'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  // GET /clientes/individual/:id/extrato
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

      const statementService = new IndividualClientService(id);
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
        title: `${res.locals.t('statement')} - ${client.fullName}`,
        client: { ...client, formattedBalance: formatCurrency(client.balance, settings) },
        clientType: 'individual',
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

  // POST /api/individual-clients/:id/withdraw
  apiWithdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = withdrawalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', errors: formatZodErrors(parsed.error) });
        return;
      }

      const service = new IndividualClientService(id);
      const result = await service.withdrawMoney(parsed.data.amount);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  // POST /clientes/individual/:id/saque (web form)
  webWithdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const parsed = withdrawalSchema.safeParse(req.body);
      if (!parsed.success) {
        const errs = formatZodErrors(parsed.error);
        res.redirect(`/clientes/individual/${id}?flash=${encodeURIComponent(errs[0]?.message || 'Erro')}&flashType=error`);
        return;
      }

      const service = new IndividualClientService(id);
      await service.withdrawMoney(parsed.data.amount);
      res.redirect(`/clientes/individual/${id}?flash=${encodeURIComponent(res.locals.t('withdrawalSuccess'))}&flashType=success`);
    } catch (err) {
      if (err instanceof AppError) {
        const id = parseInt(req.params.id);
        res.redirect(`/clientes/individual/${id}?flash=${encodeURIComponent(err.message)}&flashType=error`);
        return;
      }
      next(err);
    }
  };

  // API routes
  apiList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
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
      const parsed = createIndividualClientSchema.safeParse(req.body);
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
      const parsed = updateIndividualClientSchema.safeParse(req.body);
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

      const service = new IndividualClientService(id);
      const statement = await service.getStatement(filters);
      res.json(statement);
    } catch (err) {
      next(err);
    }
  };

  // Export PDF
  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined,
      };
      const service = this.getService();
      const result = service.listClients(filters, { page: 1, limit: 9999 });
      exportService.exportIndividualClientsPdf(result.data, res.locals.settings, res);
    } catch (err) {
      next(err);
    }
  };

  // Export CSV
  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        name: req.query.name as string || undefined,
        email: req.query.email as string || undefined,
        category: req.query.category as string || undefined,
        minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
        maxBalance: req.query.maxBalance ? parseFloat(req.query.maxBalance as string) : undefined,
      };
      const service = this.getService();
      const result = service.listClients(filters, { page: 1, limit: 9999 });
      await exportService.exportIndividualClientsCsv(result.data, res.locals.settings, res);
    } catch (err) {
      next(err);
    }
  };
}
