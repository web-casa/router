const command = process.argv[2];

if (!command || command === 'help') {
  console.log('Usage: pnpm fleet <validate>');
  process.exit(0);
}
if (command === 'validate') {
  await import('./validate.ts');
} else {
  console.error(`Unknown fleet command: ${command}`);
  process.exit(1);
}
