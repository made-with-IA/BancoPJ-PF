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

// Individual Clients (Pessoa Física) — /clientes/pf
router.get('/clientes/pf', individualCtrl.list);
router.get('/clientes/pf/novo', individualCtrl.newForm);
router.post('/clientes/pf', individualCtrl.create);
router.get('/clientes/pf/:id', individualCtrl.show);
router.get('/clientes/pf/:id/editar', individualCtrl.editForm);
router.post('/clientes/pf/:id/editar', individualCtrl.update);
router.post('/clientes/pf/:id/excluir', individualCtrl.delete);
router.get('/clientes/pf/:id/extrato', individualCtrl.statement);
router.post('/clientes/pf/:id/saque', individualCtrl.webWithdraw);

// Business Clients (Pessoa Jurídica) — /clientes/pj
router.get('/clientes/pj', businessCtrl.list);
router.get('/clientes/pj/novo', businessCtrl.newForm);
router.post('/clientes/pj', businessCtrl.create);
router.get('/clientes/pj/:id', businessCtrl.show);
router.get('/clientes/pj/:id/editar', businessCtrl.editForm);
router.post('/clientes/pj/:id/editar', businessCtrl.update);
router.post('/clientes/pj/:id/excluir', businessCtrl.delete);
router.get('/clientes/pj/:id/extrato', businessCtrl.statement);
router.post('/clientes/pj/:id/saque', businessCtrl.webWithdraw);

// Settings
router.get('/configuracoes', settingsCtrl.show);
router.post('/configuracoes', settingsCtrl.update);

export default router;
