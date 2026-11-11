import { createApp } from './app.js';
import { connectDatabase } from './shared/database/connection.js';
import { config } from './config/env.js';

async function bootstrap() {
  // Connect to MongoDB
  await connectDatabase();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`✨ Generic MongoDB API Server running on http://localhost:${config.port}/api/v1/health`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});

