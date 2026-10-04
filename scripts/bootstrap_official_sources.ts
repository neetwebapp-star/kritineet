import { bootstrapOfficialSources } from '../src/lib/nta-intelligence/nta-notification-monitor';

async function main() {
  console.log('Bootstrapping official government source registries and baseline...');
  await bootstrapOfficialSources();
  console.log('Official sources successfully registered in database.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
