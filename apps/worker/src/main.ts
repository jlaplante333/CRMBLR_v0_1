import { Worker, Queue } from 'bullmq';
import { db } from '@crmblr/db';
import { DataImportProcessor } from './processors/data-import.processor';
import { EmailProcessor } from './processors/email.processor';

async function main() {
  console.log('🚀 Starting CRMblr ETL Worker...');

  // Connect to database
  await db.connect();

  // Redis connection
  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  };

  // Create queues
  const dataImportQueue = new Queue('data-import', { connection });
  const emailQueue = new Queue('email', { connection });

  // Create workers
  const dataImportWorker = new Worker(
    'data-import',
    async (job) => {
      const processor = new DataImportProcessor();
      return await processor.process(job.data);
    },
    { connection }
  );

  const emailWorker = new Worker(
    'email',
    async (job) => {
      const processor = new EmailProcessor();
      return await processor.process(job.data);
    },
    { connection }
  );

  // Event handlers
  dataImportWorker.on('completed', (job) => {
    console.log(`✅ Data import job ${job.id} completed`);
  });

  dataImportWorker.on('failed', (job, err) => {
    console.error(`❌ Data import job ${job?.id} failed:`, err);
  });

  emailWorker.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err);
  });

  console.log('👷 ETL Worker is running...');
  console.log('📊 Listening for data import jobs');
  console.log('📧 Listening for email jobs');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await dataImportWorker.close();
    await emailWorker.close();
    await db.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down worker...');
    await dataImportWorker.close();
    await emailWorker.close();
    await db.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
