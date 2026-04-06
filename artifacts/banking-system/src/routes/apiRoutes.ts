import { Router } from 'express';
import { IndividualClientController } from '../controllers/IndividualClientController';
import { BusinessClientController } from '../controllers/BusinessClientController';
import { SettingsController } from '../controllers/SettingsController';

const router = Router();
const individualCtrl = new IndividualClientController();
const businessCtrl = new BusinessClientController();
const settingsCtrl = new SettingsController();

// Individual Clients API
router.get('/individual-clients', individualCtrl.apiList);
router.post('/individual-clients', individualCtrl.apiCreate);
router.get('/individual-clients/:id', individualCtrl.apiGet);
router.put('/individual-clients/:id', individualCtrl.apiUpdate);
router.delete('/individual-clients/:id', individualCtrl.apiDelete);
router.post('/individual-clients/:id/withdraw', individualCtrl.apiWithdraw);
router.get('/individual-clients/:id/statement', individualCtrl.apiStatement);

// Business Clients API
router.get('/business-clients', businessCtrl.apiList);
router.post('/business-clients', businessCtrl.apiCreate);
router.get('/business-clients/:id', businessCtrl.apiGet);
router.put('/business-clients/:id', businessCtrl.apiUpdate);
router.delete('/business-clients/:id', businessCtrl.apiDelete);
router.post('/business-clients/:id/withdraw', businessCtrl.apiWithdraw);
router.get('/business-clients/:id/statement', businessCtrl.apiStatement);

// Settings API
router.get('/settings', settingsCtrl.apiGet);
router.put('/settings', settingsCtrl.apiUpdate);

// Exports
router.get('/exports/individual-clients/pdf', individualCtrl.exportPdf);
router.get('/exports/individual-clients/csv', individualCtrl.exportCsv);
router.get('/exports/business-clients/pdf', businessCtrl.exportPdf);
router.get('/exports/business-clients/csv', businessCtrl.exportCsv);

export default router;
