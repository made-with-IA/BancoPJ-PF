import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/SettingsService';
import { updateSettingsSchema, formatZodErrors } from '../utils/validation';

export class SettingsController {
  private service = new SettingsService();

  show = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const settings = this.service.getSettings();
      res.render('settings/index', {
        title: res.locals.t('settings'),
        settings,
        errors: [],
        translations: res.locals.translations,
        lang: res.locals.lang,
        flash: req.query.flash || null,
        flashType: req.query.flashType || 'success',
      });
    } catch (err) {
      next(err);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        const settings = this.service.getSettings();
        res.render('settings/index', {
          title: res.locals.t('settings'),
          settings,
          errors: formatZodErrors(parsed.error),
          translations: res.locals.translations,
          lang: res.locals.lang,
          flash: null,
          flashType: null,
        });
        return;
      }
      this.service.updateSettings(parsed.data);
      res.redirect(`/configuracoes?flash=${encodeURIComponent(res.locals.t('settingsUpdated'))}&flashType=success`);
    } catch (err) {
      next(err);
    }
  };

  apiGet = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const settings = this.service.getSettings();
      res.json(settings);
    } catch (err) {
      next(err);
    }
  };

  apiUpdate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', errors: formatZodErrors(parsed.error) });
        return;
      }
      const settings = this.service.updateSettings(parsed.data);
      res.json(settings);
    } catch (err) {
      next(err);
    }
  };
}
