import 'dotenv/config';
import { loadEnv } from './env.js';
import { createServer } from './server.js';
import { toAlpacaConfig } from './alpaca.js';
import * as E from 'fp-ts/Either';

const start = () => {
  const envResult = loadEnv();

  if (E.isLeft(envResult)) {
    console.error(envResult.left.message);
    process.exit(1);
  }

  const env = envResult.right;
  const server = createServer(toAlpacaConfig(env));

  server.listen(env.port, () => {
    console.log(`Listening on http://localhost:${env.port}`);
  });
};

start();
