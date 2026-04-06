import express from 'express';
import path from 'path';
import methodOverride from 'method-override';
import ejs from 'ejs';
import { initializeDatabase } from './database/init';
import { settingsMiddleware } from './middlewares/settingsMiddleware';
import { errorHandler } from './middlewares/errorHandler';
import webRoutes from './routes/webRoutes';
import apiRoutes from './routes/apiRoutes';

initializeDatabase();

const app = express();

const viewsDir = path.join(__dirname, 'views');

app.set('view engine', 'ejs');
app.set('views', viewsDir);

// Register EJS engine with explicit opts to prevent EJS from treating template
// locals named 'client', 'scope', 'strict', etc. as EJS compilation options.
// Without this, passing a truthy `client` local would trigger EJS client-mode
// and make include() unavailable in the template.
app.engine('ejs', (filePath: string, data: object, cb: (err: Error | null, rendered?: string) => void) => {
  ejs.renderFile(filePath, data as Record<string, unknown>, { views: [viewsDir] }, cb);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Serve static files
app.use('/banking', express.static(path.join(__dirname, '..', 'public')));

// Settings middleware - attaches settings and translations to res.locals
app.use(settingsMiddleware);

// Attach current path and query string helper
app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.queryStringWithPage = (page: number): string => {
    const q = { ...req.query, page: String(page) };
    return Object.entries(q).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
  };
  next();
});

// Routes
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// Error handler
app.use(errorHandler);

export default app;
