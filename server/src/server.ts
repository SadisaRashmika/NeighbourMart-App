import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { environment } from './config/environment.js';

const app = createApp();

async function startServer() {
  await connectDatabase(environment.mongoUri);

  app.listen(environment.port, () => {
    console.log(`Server running on port ${environment.port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start the backend', error);
  process.exitCode = 1;
});
