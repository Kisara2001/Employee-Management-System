import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function bootstrap() {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on http://localhost:${env.PORT}`);
      // eslint-disable-next-line no-console
      console.log(`CORS allowed origin: ${env.CORS_ORIGIN}`);
      // eslint-disable-next-line no-console
      console.log('Swagger docs at /docs');
    });
    server.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Server error', err);
      process.exit(1);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start', err);
    process.exit(1);
  }
}

bootstrap();
