import { singleton } from 'tsyringe';
import { IMiddleware, MiddlewareContext, NextFunction } from '@core/interfaces/IMiddleware';
import { Middleware } from '@core/decorators';
import { Logger } from '@common/logger';

@Middleware()
@singleton()
export class LoggingMiddleware implements IMiddleware {
  constructor(private logger: Logger) {}

  public async use(context: MiddlewareContext, next: NextFunction): Promise<void> {
    const { interaction } = context;
    const startTime = Date.now();

    this.logger.info('Command execution started', {
      commandName: interaction.data.name,
      userId: interaction.user.id,
      guildId: interaction.guildID || 'DM',
    });

    try {
      await next();
      const duration = Date.now() - startTime;
      this.logger.info('Command execution completed', {
        commandName: interaction.data.name,
        userId: interaction.user.id,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Command execution failed', {
        commandName: interaction.data.name,
        userId: interaction.user.id,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
