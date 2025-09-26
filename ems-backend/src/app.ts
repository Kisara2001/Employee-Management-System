import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import { mountSwagger } from './docs/swagger';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ✅ mount Swagger at /docs (comes from swagger.ts)
mountSwagger(app);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
