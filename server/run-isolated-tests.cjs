require('dotenv').config({ quiet: true });
const { spawnSync } = require('node:child_process');
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', 'tests/checkout.test.ts'], {
  env: { ...process.env, TEST_MONGO_URI: process.env.MONGO_URI }, stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
