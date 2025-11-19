import 'reflect-metadata';
import { container } from 'tsyringe';
import { ExtendedClient } from '@core/client';
import { Logger } from '@common/logger';
import { Config } from '@config/Config';
import { DatabaseService } from '@database/database.service';
import { GeneralModule } from '@modules/general/general.module';
import { ModerationModule } from '@modules/moderation/moderation.module';
import { HealthCheckServer } from './health/HealthCheckServer';

async function bootstrap(): Promise<void> {
  const logger = container.resolve(Logger);
  const config = container.resolve(Config);

  logger.info('🚀 Starting Discord Bot...');
  logger.info(`Environment: ${config.get('nodeEnv')}`);
  logger.info(`Log Level: ${config.get('logLevel')}`);

  try {
    const client = container.resolve(ExtendedClient);

    if (config.get('databaseUrl')) {
      const database = container.resolve(DatabaseService);
      await database.connect();
      logger.info('✅ Database connected');
    } else {
      logger.warn('⚠️ No database URL provided, database features will be disabled');
    }

    const generalModule = container.resolve(GeneralModule);
    await generalModule.initialize(client);
    client.registerModule(generalModule);

    const moderationModule = container.resolve(ModerationModule);
    await moderationModule.initialize(client);
    client.registerModule(moderationModule);

    await client.initialize();

    const healthCheckServer = container.resolve(HealthCheckServer);
    healthCheckServer.start();

    logger.info('✅ Bot is fully operational!');
  } catch (error) {
    logger.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  const logger = container.resolve(Logger);
  logger.info(`${signal} received, shutting down gracefully...`);

  try {
    const client = container.resolve(ExtendedClient);
    await client.shutdown();

    if (container.isRegistered(DatabaseService)) {
      const database = container.resolve(DatabaseService);
      await database.disconnect();
    }

    if (container.isRegistered(HealthCheckServer)) {
      const healthServer = container.resolve(HealthCheckServer);
      healthServer.stop();
    }

    logger.info('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  const logger = container.resolve(Logger);
  logger.error('Unhandled Promise Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  const logger = container.resolve(Logger);
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((error) => {
  const logger = container.resolve(Logger);
  logger.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
