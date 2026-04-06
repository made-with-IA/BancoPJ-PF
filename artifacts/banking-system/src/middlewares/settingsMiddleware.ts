import { Request, Response, NextFunction } from 'express';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { getTranslations } from '../utils/i18n';

const settingsRepo = new SettingsRepository();

export function settingsMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const settings = settingsRepo.getActiveSettings();
    const lang = settings?.language || 'pt';
    const translations = getTranslations(lang);

    res.locals.settings = settings;
    res.locals.lang = lang;
    res.locals.translations = translations;
    res.locals.t = (key: string) => translations[key] || key;

    next();
  } catch {
    const translations = getTranslations('pt');
    res.locals.settings = { language: 'pt', currencyFormat: 'BRL', dateFormat: 'DD/MM/YYYY' };
    res.locals.lang = 'pt';
    res.locals.translations = translations;
    res.locals.t = (key: string) => translations[key] || key;
    next();
  }
}
