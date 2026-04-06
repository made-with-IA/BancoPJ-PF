import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { IndividualClientController } from '../controllers/IndividualClientController';
import { BusinessClientController } from '../controllers/BusinessClientController';
import { SettingsController } from '../controllers/SettingsController';

const router = Router();
const dashboardCtrl = new DashboardController();
const individualCtrl = new IndividualClientController();
const businessCtrl = new BusinessClientController();
const settingsCtrl = new SettingsController();

// Dashboard
router.get('/', dashboardCtrl.index);

// Individual Clients
router.get('/clientes/individual', individualCtrl.list);
router.get('/clientes/individual/novo', individualCtrl.newForm);
router.post('/clientes/individual', individualCtrl.create);
router.get('/clientes/individual/:id', individualCtrl.show);
router.get('/clientes/individual/:id/editar', individualCtrl.editForm);
router.post('/clientes/individual/:id/editar', individualCtrl.update);
router.post('/clientes/individual/:id/excluir', individualCtrl.delete);
router.get('/clientes/individual/:id/extrato', individualCtrl.statement);
router.post('/clientes/individual/:id/saque', individualCtrl.webWithdraw);

// Business Clients
router.get('/clientes/business', businessCtrl.list);
router.get('/clientes/business/novo', businessCtrl.newForm);
router.post('/clientes/business', businessCtrl.create);
router.get('/clientes/business/:id', businessCtrl.show);
router.get('/clientes/business/:id/editar', businessCtrl.editForm);
router.post('/clientes/business/:id/editar', businessCtrl.update);
router.post('/clientes/business/:id/excluir', businessCtrl.delete);
router.get('/clientes/business/:id/extrato', businessCtrl.statement);
router.post('/clientes/business/:id/saque', businessCtrl.webWithdraw);

// Settings
router.get('/configuracoes', settingsCtrl.show);
router.post('/configuracoes', settingsCtrl.update);

export default router;
