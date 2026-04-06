import { Request, Response, NextFunction } from 'express';
import { getTranslations } from '../utils/i18n';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(
    public errors: Array<{ field: string; message: string }>,
    message: string = 'Erro de validação'
  ) {
    super(400, message, true);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(404, message, true);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados') {
    super(500, message, true);
    this.name = 'DatabaseError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const lang = (res.locals.lang as string) || 'pt';
  const translations = getTranslations(lang);
  const isApi = req.path.startsWith('/api/');

  if (err instanceof ValidationError) {
    if (isApi) {
      res.status(400).json({ error: 'Validation Error', message: err.message, errors: err.errors });
    } else {
      res.status(400).render('error', {
        title: translations['validationError'] || 'Erro de Validação',
        message: err.message,
        errors: err.errors,
        translations,
        lang,
      });
    }
    return;
  }

  if (err instanceof NotFoundError) {
    if (isApi) {
      res.status(404).json({ error: 'Not Found', message: err.message });
    } else {
      res.status(404).render('error', {
        title: translations['notFound'] || 'Não Encontrado',
        message: err.message,
        errors: [],
        translations,
        lang,
      });
    }
    return;
  }

  if (err instanceof AppError) {
    if (isApi) {
      res.status(err.statusCode).json({ error: err.name, message: err.message });
    } else {
      res.status(err.statusCode).render('error', {
        title: translations['error'] || 'Erro',
        message: err.message,
        errors: [],
        translations,
        lang,
      });
    }
    return;
  }

  console.error('Unhandled error:', err);
  if (isApi) {
    res.status(500).json({ error: 'Internal Server Error', message: translations['errorGeneric'] || 'Ocorreu um erro interno.' });
  } else {
    res.status(500).render('error', {
      title: translations['internalError'] || 'Erro Interno',
      message: translations['errorGeneric'] || 'Ocorreu um erro. Tente novamente.',
      errors: [],
      translations,
      lang,
    });
  }
}
